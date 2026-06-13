/**
 * Edge 运行时安全对称加密组件
 * 基于 Web Crypto API 原生实现，完美兼容 Node.js 与 Edge Runtime (Middleware)。
 * 对 session 进行 AES-GCM (256-bit) 加密与认证防篡改防护。
 */

const SECRET_KEY_STR = (process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-secret-fallback-key-32ch-long-enough').substring(0, 32);

/**
 * 将 base64url 格式字符串还原为 Uint8Array
 */
function base64ToUint8Array(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binString = atob(base64);
  const arr = new Uint8Array(binString.length);
  for (let i = 0; i < binString.length; i++) {
    arr[i] = binString.charCodeAt(i);
  }
  return arr;
}

/**
 * 将 Uint8Array 转化为 base64url 格式字符串
 */
function uint8ArrayToBase64(arr: Uint8Array): string {
  let binString = '';
  // 采用分段或常规拼接以提高性能
  for (let i = 0; i < arr.length; i++) {
    binString += String.fromCharCode(arr[i]);
  }
  return btoa(binString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * 导入密钥生成 CryptoKey
 */
async function getCryptoKey() {
  const enc = new TextEncoder();
  const keyData = enc.encode(SECRET_KEY_STR);
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 加密会话 Payload
 * @param payload 需要序列化加密的 JS 对象
 * @returns 加密后的 base64url.base64url 密文串，失败返回空串
 */
export async function encryptSession(payload: any): Promise<string> {
  try {
    const key = await getCryptoKey();
    const enc = new TextEncoder();
    const encodedPayload = enc.encode(JSON.stringify(payload));
    
    // 生成 12 字节随机 IV (GCM 的标准 IV 长度)
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedPayload
    );
    
    const ivBase64 = uint8ArrayToBase64(iv);
    const ciphertextBase64 = uint8ArrayToBase64(new Uint8Array(ciphertext));
    
    return `${ivBase64}.${ciphertextBase64}`;
  } catch (e: any) {
    console.error('[Crypto SDK] Encrypt session failed:', e.message);
    return '';
  }
}

/**
 * 解密会话 Token
 * @param token 密文串 (iv.ciphertext)
 * @returns 解密反序列化后的 JS 对象，失败返回 null
 */
export async function decryptSession(token: string): Promise<any> {
  try {
    if (!token || !token.includes('.')) return null;
    const [ivBase64, ciphertextBase64] = token.split('.');
    
    const iv = base64ToUint8Array(ivBase64);
    const ciphertext = base64ToUint8Array(ciphertextBase64);
    
    const key = await getCryptoKey();
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    
    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decrypted));
  } catch (e: any) {
    // 解密或认证标签失败 (如数据遭修改、秘钥不符、数据不完整)，直接拦截
    console.warn('[Crypto SDK] Decrypt session failed (tampered / malformed):', e.message);
    return null;
  }
}
