import { NextResponse } from "next/server";
import { getXmpSnapshot } from "@/lib/xmp/futureclass-adapter";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getXmpSnapshot();
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-XMP-Data-Mode": snapshot.mode,
      "X-XMP-Privacy": "aggregate-only",
    },
  });
}
