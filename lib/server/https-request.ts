import https from 'https';

export function httpsRequest(urlStr: string, options: https.RequestOptions, body?: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const url = new URL(urlStr);
        
        const bodyStr = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
        const headers: Record<string, string | number> = { ...(options.headers as Record<string, string | number>) };
        
        if (bodyStr) {
            headers['Content-Length'] = Buffer.byteLength(bodyStr);
        }

        const reqOptions: https.RequestOptions = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname + url.search,
            method: options.method || 'GET',
            headers: headers,
            rejectUnauthorized: false
        };

        const req = https.request(reqOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if ((res.statusCode || 200) >= 400) {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                } else {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                         resolve(data);
                    }
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (bodyStr) {
            req.write(bodyStr);
        }

        req.end();
    });
}
