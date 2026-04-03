import { NextRequest, NextResponse } from 'next/server';

export const config = {
    api: { bodyParser: { sizeLimit: '4mb' } }
};

export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type') || '';
        let pdfBase64: string, fileName: string;

        if (contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await request.text();
            const params = new URLSearchParams(formData);
            const dataStr = params.get('data') || '{}';
            const parsed = JSON.parse(dataStr);
            pdfBase64 = parsed.pdfBase64;
            fileName = parsed.fileName;
        } else {
            const json = await request.json();
            pdfBase64 = json.pdfBase64;
            fileName = json.fileName;
        }

        if (!pdfBase64 || !fileName) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 });
        }

        const pdfBuffer = Buffer.from(pdfBase64, 'base64');

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
                'Content-Length': pdfBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('PDF download error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
