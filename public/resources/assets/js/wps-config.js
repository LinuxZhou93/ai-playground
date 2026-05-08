/**
 * WPS 开放平台配置
 * 请在 https://open.wps.cn/ 申请后填入
 */
const WPS_CONFIG = {
    APP_ID: 'YOUR_APP_ID',         // 请填入你的 AppID
    APP_SECRET: 'YOUR_APP_SECRET', // 请填入你的 AppSecret
    REDIRECT_URI: window.location.origin + '/wps-analysis.html', // 授权后的回调地址
    SCOPES: 'files_read',          // 权限范围
    AUTH_URL: 'https://open.wps.cn/oauth2/authorize',
    TOKEN_URL: 'https://openapi.kdocs.cn/oauth2/token',
    BASE_API: 'https://openapi.kdocs.cn/api/v3'
};

window.WPS_CONFIG = WPS_CONFIG;
