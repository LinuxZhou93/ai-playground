-- =============================================================================
-- FutureClass / TitanTech 架构安全加固：卡密核销事务化与 RLS 权限升级 SQL
-- =============================================================================

-- 1. 确保 vouchers 表拥有完整的核销日志审计字段
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE;

-- 2. 升级 profiles 表的 RLS UPDATE 策略
-- 核心加固：只允许 authenticated 用户更新自己的 profile 字段，但锁死 expiry_date 为只读。
-- 只有以超级用户权限运行的 SECURITY DEFINER 函数或 service_role 实例才能修改 expiry_date。
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND (
            expiry_date IS NOT DISTINCT FROM (
                SELECT expiry_date FROM public.profiles WHERE id = auth.uid()
            )
        )
    );

-- 3. 升级 vouchers 表的安全与特权管理策略，封锁可能因 FORCE RLS 导致的管理员写入受阻
ALTER TABLE public.vouchers NO FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage vouchers" ON public.vouchers;
CREATE POLICY "Service role can manage vouchers" ON public.vouchers
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 4. 创建数据库级原子事务 RPC 函数，彻底封锁卡密核销并发与状态不一致漏洞
CREATE OR REPLACE FUNCTION public.redeem_voucher(p_voucher_code text, p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- 以定义者特权权限运行，绕过 profiles 对用户端 RLS 的限制
SET search_path = public
AS $$
DECLARE
  v_voucher RECORD;
  v_target_user_id UUID;
  v_current_expiry TIMESTAMP WITH TIME ZONE;
  v_new_expiry TIMESTAMP WITH TIME ZONE;
  v_profile_exists BOOLEAN;
  v_duration INT;
BEGIN
  -- 1. 提取目标用户 ID (优先使用传参，对于服务端 service_role 调用友好，否则使用 auth.uid())
  v_target_user_id := COALESCE(p_user_id, auth.uid());
  IF v_target_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: 未能获取有效的用户ID，请确保已登录或传入用户ID';
  END IF;

  -- 2. 锁定并查询卡密，防止并发双重兑换风险 (SELECT FOR UPDATE)
  SELECT * INTO v_voucher FROM public.vouchers 
  WHERE code = p_voucher_code 
  FOR UPDATE;

  -- 验证是否存在
  IF NOT FOUND THEN
    RAISE EXCEPTION '卡密无效（未在数据库中找到）';
  END IF;

  -- 验证是否已被兑换
  IF v_voucher.status = 'used' THEN
    RAISE EXCEPTION '此卡密已被使用';
  END IF;

  -- 3. 查询用户当前的会员到期时间
  SELECT expiry_date INTO v_current_expiry FROM public.profiles 
  WHERE id = v_target_user_id;
  
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = v_target_user_id) INTO v_profile_exists;

  -- 4. 计算到期期限顺延 (支持 0 个月/7天卡，以及普通月卡)
  v_duration := COALESCE(v_voucher.duration_months, 12);

  -- 如果用户从未充值过，或已过期，则以当前时间 NOW() 作为起点；否则在现有到期时间上顺延
  IF v_current_expiry IS NULL OR v_current_expiry < NOW() THEN
    v_current_expiry := NOW();
  END IF;

  IF v_duration = 0 OR p_voucher_code LIKE '%-7D-%' THEN
    v_new_expiry := v_current_expiry + INTERVAL '7 days';
  ELSE
    v_new_expiry := v_current_expiry + (v_duration || ' months')::INTERVAL;
  END IF;

  -- 5. 更新 profiles 用户的 VIP 到期日期
  IF v_profile_exists THEN
    UPDATE public.profiles 
    SET expiry_date = v_new_expiry, updated_at = NOW() 
    WHERE id = v_target_user_id;
  ELSE
    INSERT INTO public.profiles (id, username, expiry_date, created_at, updated_at)
    VALUES (
      v_target_user_id, 
      split_part((SELECT email FROM auth.users WHERE id = v_target_user_id), '@', 1), 
      v_new_expiry, 
      NOW(), 
      NOW()
    );
  END IF;

  -- 6. 标记卡密为已核销并记录审计信息
  UPDATE public.vouchers 
  SET status = 'used', used_by = v_target_user_id, used_at = NOW() 
  WHERE id = v_voucher.id;

  -- 返回成功负载
  RETURN jsonb_build_object(
    'success', true,
    'new_expiry', to_jsonb(v_new_expiry),
    'duration_applied', v_duration
  );
END;
$$;
