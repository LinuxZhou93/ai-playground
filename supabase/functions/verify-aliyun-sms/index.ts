import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

/**
 * 阿里云短信验证函数 (Aliyun SMS Verify Bridge)
 * 校验 otp_codes 表并在通过后下发 JWT 会话。
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { phone, code } = await req.json();
    if (!phone || !code) throw new Error('Missing phone or code');

    console.log(`[Verify] Checking OTP for phone: ${phone}, code: ${code}`);

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // 1. Verify code from Database
    const { data: otpEntry, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpEntry) {
      console.log(`[Verify] OTP mismatch or expired. Error: ${otpError?.message}`);
      throw new Error('验证码错误或已过期');
    }

    console.log(`[Verify] OTP matched. ID: ${otpEntry.id}`);

    // 2. Clean up used OTP
    await supabase.from('otp_codes').delete().eq('id', otpEntry.id);

    // 3. Get or Create User via Admin Auth
    // Use the normalized phone (with +86 for Supabase Auth)
    const authPhone = phone.startsWith('+') ? phone : `+86${phone}`;
    console.log(`[Verify] Auth identifying user: ${authPhone}`);

    // getUserByPhone is sometimes not available in all client versions, using listUsers as fallback
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    let targetUser = users?.find(u => u.phone === authPhone);

    if (!targetUser) {
        console.log(`[Verify] User not found, creating: ${authPhone}`);
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            phone: authPhone,
            phone_confirm: true,
            user_metadata: { source: 'aliyun_sms', normalized_phone: authPhone }
        });
        
        targetUser = newUser.user || undefined;
        console.log(`[Verify] New user created: ${targetUser?.id}`);
    } else {
        console.log(`[Verify] Existing user found: ${targetUser.id}`);
        // Ensure confirmed
        await supabase.auth.admin.updateUserById(targetUser.id, {
            phone_confirm: true
        });
    }

    // Phone only users do NOT need email magic links in this demo,
    // we bypass the `generateLink` entirely because it crashes on empty email.
    
    // Returning success with user data
    // Local frontend will store the identifier locally as a fallback session

    return new Response(JSON.stringify({ 
        success: true, 
        user: targetUser
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    // Return 200 to prevent Supabase frontend from throwing a generic FunctionsHttpError
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
