import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

/**
 * 阿里云短信发送函数 (Aliyun SMS Bridge)
 * 适配 Deno 边缘环境，包含签名算法与数据库持久化。
 */

const ALIYUN_ACCESS_KEY_ID = Deno.env.get('ALIYUN_ACCESS_KEY_ID');
const ALIYUN_ACCESS_KEY_SECRET = Deno.env.get('ALIYUN_ACCESS_KEY_SECRET');
const ALIYUN_SIGN_NAME = Deno.env.get('ALIYUN_SIGN_NAME') || '小创客';
const ALIYUN_TEMPLATE_CODE = Deno.env.get('ALIYUN_TEMPLATE_CODE') || 'SMS_333430599';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function hmacSha1(key: string, message: string) {
  const encoder = new TextEncoder();
  const keyBuffer = encoder.encode(key);
  const messageBuffer = encoder.encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageBuffer);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

function percentEncode(str: string) {
  return encodeURIComponent(str)
    .replace(/\+/g, '%20')
    .replace(/\*/g, '%2A')
    .replace(/%7E/g, '~');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { phone } = await req.json();
    if (!phone) throw new Error('Missing phone number');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[SMS] Generating code ${code} for ${phone}`);

    // 1. Save to Database (using service role for bypass RLS)
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { error: dbError } = await supabase
      .from('otp_codes')
      .insert({
        phone: phone,
        code: code,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 mins expiry
      });

    if (dbError) throw new Error(`Database error: ${dbError.message}`);

    // 2. Aliyun Signature & Send
    const params: Record<string, string> = {
      AccessKeyId: ALIYUN_ACCESS_KEY_ID!,
      Action: 'SendSms',
      Format: 'JSON',
      PhoneNumbers: phone,
      RegionId: 'cn-hangzhou',
      SignName: ALIYUN_SIGN_NAME,
      SignatureMethod: 'HMAC-SHA1',
      SignatureNonce: Math.random().toString(36).substring(2),
      SignatureVersion: '1.0',
      TemplateCode: ALIYUN_TEMPLATE_CODE,
      TemplateParam: JSON.stringify({ code }),
      Timestamp: new Date().toISOString().replace(/\.\d{3}/, ''),
      Version: '2017-05-25',
    };

    const sortedKeys = Object.keys(params).sort();
    const canonicalizedQueryString = sortedKeys
      .map(key => `${percentEncode(key)}=${percentEncode(params[key])}`)
      .join('&');

    const stringToSign = `GET&${percentEncode('/')}&${percentEncode(canonicalizedQueryString)}`;
    const signature = await hmacSha1(`${ALIYUN_ACCESS_KEY_SECRET}&`, stringToSign);

    const url = `https://dysmsapi.aliyuncs.com/?${canonicalizedQueryString}&Signature=${percentEncode(signature)}`;
    
    const aliResponse = await fetch(url);
    const result = await aliResponse.json();

    if (result.Code !== 'OK') throw new Error(result.Message || 'Aliyun SMS failed');

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
