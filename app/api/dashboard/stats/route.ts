import { NextResponse } from 'next/server';

export async function GET() {
  // 模拟稍微延迟，提供更好的骨架屏体感
  await new Promise((resolve) => setTimeout(resolve, 100));

  const mockStats = [
    { label: '周一', value: 120 },
    { label: '周二', value: 180 },
    { label: '周三', value: 150 },
    { label: '周四', value: 220 },
    { label: '周五', value: 300 },
    { label: '周六', value: 250 },
    { label: '周日', value: 350 },
  ];

  return NextResponse.json(mockStats);
}
