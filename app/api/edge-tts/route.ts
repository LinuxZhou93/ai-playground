import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export async function POST(req: NextRequest) {
  try {
    const { text, voice = "zh-CN-XiaoxiaoNeural" } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    
    const { audioStream } = tts.toStream(text);

    // Convert Node.js readable stream to Web Stream
    const webStream = new ReadableStream({
      start(controller) {
        audioStream.on('data', (chunk) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        audioStream.on('end', () => {
          controller.close();
        });
        audioStream.on('close', () => {
          try {
            controller.close();
          } catch (e) {
            // Already closed
          }
        });
        audioStream.on('error', (err) => {
          controller.error(err);
        });
      }
    });

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
    });
  } catch (error: any) {
    console.error("Edge TTS error:", error);
    return NextResponse.json({ error: error.message || "TTS Error" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
