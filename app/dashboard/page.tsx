'use client';

import { useEffect, useState } from 'react';
import DashboardCharts from '../../components/DashboardCharts';

export default function DashboardPage() {
  const [data, setData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((json) => {
        setData(json);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setData([]);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">系统数据监控看板</h1>
        <p className="text-slate-400">查看当前系统的实时数据分析图表。</p>
        <DashboardCharts isLoading={isLoading} data={data} />
      </div>
    </div>
  );
}
