import { NextRequest, NextResponse } from "next/server";

const assets = {
  logo: "https://imagecdn.didano.com/ximapeng-website/logo2.png",
  campus:
    "http://imagecdn.didano.com/formal/school-website-manage/pic/1000/2021-9/7tdE8FdawRffa8zabtKsmk6jXas7G64d",
} as const;

export async function GET(request: NextRequest) {
  const asset = request.nextUrl.searchParams.get(
    "asset",
  ) as keyof typeof assets;
  const source = assets[asset];
  if (!source)
    return NextResponse.json({ error: "UNKNOWN_ASSET" }, { status: 404 });
  try {
    const response = await fetch(source, {
      next: { revalidate: 86_400 },
      headers: { "User-Agent": "XMP-local-design-reference/1.0" },
    });
    if (!response.ok || !response.body) throw new Error("MEDIA_UNAVAILABLE");
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "X-XMP-Asset-Source": "scxiyou.com-official",
      },
    });
  } catch {
    return NextResponse.json({ error: "MEDIA_UNAVAILABLE" }, { status: 502 });
  }
}
