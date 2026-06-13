'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Layers, Compass, Eye, ShieldAlert } from 'lucide-react';

export default function SimVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);
  const [sensorData, setSensorData] = useState({ left: 120, center: 150, right: 100 });
  const [status, setStatus] = useState<string>('系统就绪。等待 Python 代码触发指令...');
  const [bubbleText, setBubbleText] = useState<string | null>(null);

  // 物理实体状态
  const botState = useRef({
    x: 100,
    y: 150,
    targetX: 100,
    targetY: 150,
    angle: 0,
    targetAngle: 0,
    isScanning: false,
    trail: [] as { x: number; y: number; alpha: number }[],
    speed: 3,
    size: 24,
  });

  // 刷新苹果状态
  const [apple, setApple] = useState<{ x: number; y: number; active: boolean }>({
    x: 450,
    y: 150,
    active: true,
  });

  useEffect(() => {
    // 注册全局桥接回调，供 Pyodide 内 Mock 的 RobotAgent 调用
    (window as any).onRobotMove = (x: number, y: number) => {
      // 映射到 canvas 的坐标 (canvas 宽 600, 高 300)
      const mappedX = (x / 100) * 500 + 50;
      const mappedY = (y / 100) * 200 + 50;
      botState.current.targetX = mappedX;
      botState.current.targetY = mappedY;
      setStatus(`[CPU 决策] 执行移动: -> (${x.toFixed(0)}, ${y.toFixed(0)})`);
    };

    (window as any).onRobotSay = (msg: string) => {
      setBubbleText(msg);
      setStatus(`[Agent 输出] ${msg}`);
      // 4秒后气泡消失
      setTimeout(() => setBubbleText(null), 4000);
    };

    (window as any).onRobotScan = (enabled: boolean) => {
      botState.current.isScanning = enabled;
      if (enabled) {
        setStatus('[感知感知] 激光雷达避障扫描已启动。');
      }
    };

    (window as any).onRobotReset = () => {
      botState.current.x = 100;
      botState.current.y = 150;
      botState.current.targetX = 100;
      botState.current.targetY = 150;
      botState.current.angle = 0;
      setApple({ x: 450, y: 150, active: true });
      setBubbleText(null);
      setStatus('重置仿真世界。');
    };

    return () => {
      delete (window as any).onRobotMove;
      delete (window as any).onRobotSay;
      delete (window as any).onRobotScan;
      delete (window as any).onRobotReset;
    };
  }, []);

  // Canvas 渲染主循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let scanAngle = 0;

    const render = () => {
      // 1. 清空画布并绘制深色未来背景
      ctx.fillStyle = '#0a0b0e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. 绘制 SLAM 科技感网格
      ctx.strokeStyle = 'rgba(0, 123, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 25;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 3. 更新机器人的插值移动 (Lerp)
      const bot = botState.current;
      const dx = bot.targetX - bot.x;
      const dy = bot.targetY - bot.y;
      const distance = Math.hypot(dx, dy);

      if (distance > 1) {
        // 旋转角度对准目标
        bot.targetAngle = Math.atan2(dy, dx);
        // 角度平滑过渡
        let angleDiff = bot.targetAngle - bot.angle;
        // 限制在 [-PI, PI]
        angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        bot.angle += angleDiff * 0.1;

        // 平滑移动
        bot.x += Math.cos(bot.angle) * bot.speed;
        bot.y += Math.sin(bot.angle) * bot.speed;

        // 产生足迹粒子
        if (Math.random() < 0.3) {
          bot.trail.push({ x: bot.x, y: bot.y, alpha: 0.6 });
        }
      }

      // 检查是否碰到了苹果
      if (apple.active) {
        const distToApple = Math.hypot(apple.x - bot.x, apple.y - bot.y);
        if (distToApple < bot.size + 15) {
          setApple(prev => ({ ...prev, active: false }));
          setBubbleText('🦾 苹果抓取成功！');
          setStatus('🎉 [执行成功] 机械臂抓取指令已完成，苹果放入仓储盒！');
        }
      }

      // 4. 绘制粒子尾迹
      bot.trail = bot.trail.map(p => ({ ...p, alpha: p.alpha - 0.015 })).filter(p => p.alpha > 0);
      bot.trail.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 123, 255, ${p.alpha})`;
        ctx.shadowColor = '#007BFF';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // 重置阴影
      });

      // 5. 绘制苹果目标
      if (apple.active) {
        ctx.beginPath();
        ctx.arc(apple.x, apple.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        // 苹果内核 (高亮红色)
        ctx.beginPath();
        ctx.arc(apple.x, apple.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        // 叶子
        ctx.beginPath();
        ctx.moveTo(apple.x, apple.y - 8);
        ctx.quadraticCurveTo(apple.x + 6, apple.y - 14, apple.x + 2, apple.y - 14);
        ctx.fillStyle = '#10b981';
        ctx.fill();
      }

      // 6. 绘制激光雷达扫描扇区
      if (bot.isScanning) {
        scanAngle += 0.05;
        ctx.beginPath();
        ctx.moveTo(bot.x, bot.y);
        ctx.arc(bot.x, bot.y, 130, scanAngle - 0.4, scanAngle + 0.4);
        ctx.closePath();
        ctx.fillStyle = 'rgba(6, 182, 212, 0.1)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(bot.x, bot.y, 130, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 7. 绘制避障红外激光测距线 (3根：左、中、右)
      const laserAngles = [-0.4, 0, 0.4];
      const laserDistances: number[] = [];

      laserAngles.forEach((offsetAngle, idx) => {
        const angle = bot.angle + offsetAngle;
        let laserLength = 160;

        // 检测与苹果的物理距离折射线
        if (apple.active) {
          // 极简线段-圆碰撞检测
          const apDx = apple.x - bot.x;
          const apDy = apple.y - bot.y;
          const apDist = Math.hypot(apDx, apDy);
          const proj = apDx * Math.cos(angle) + apDy * Math.sin(angle);
          if (proj > 0 && proj < laserLength) {
            const perpDist = Math.abs(-apDx * Math.sin(angle) + apDy * Math.cos(angle));
            if (perpDist < 20) {
              laserLength = proj - 10;
            }
          }
        }

        const endX = bot.x + Math.cos(angle) * laserLength;
        const endY = bot.y + Math.sin(angle) * laserLength;

        // 测距数据
        laserDistances.push(laserLength);

        // 绘制激光线
        ctx.beginPath();
        ctx.moveTo(bot.x, bot.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = laserLength < 100 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 激光终点亮点粒子
        ctx.beginPath();
        ctx.arc(endX, endY, 3, 0, Math.PI * 2);
        ctx.fillStyle = laserLength < 100 ? '#ef4444' : '#10b981';
        ctx.fill();
      });

      // 实时更新测距数据状态
      if (Math.random() < 0.2) {
        setSensorData({
          left: Math.round(laserDistances[0]),
          center: Math.round(laserDistances[1]),
          right: Math.round(laserDistances[2]),
        });
      }

      // 8. 绘制查特熊智能小车 (RobotAgent)
      ctx.save();
      ctx.translate(bot.x, bot.y);
      ctx.rotate(bot.angle);

      // 小车底盘底座
      ctx.beginPath();
      ctx.arc(0, 0, bot.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(31, 41, 55, 0.9)';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 动力履带 (左、右)
      ctx.fillStyle = '#111827';
      ctx.fillRect(-18, -bot.size - 3, 36, 6);
      ctx.fillRect(-18, bot.size - 3, 36, 6);

      // 激光测距雷达舱 (橙色圆环)
      ctx.beginPath();
      ctx.arc(-6, 0, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316';
      ctx.fill();

      // 小车头部指示方向
      ctx.beginPath();
      ctx.moveTo(bot.size - 2, 0);
      ctx.lineTo(bot.size - 10, -6);
      ctx.lineTo(bot.size - 10, 6);
      ctx.closePath();
      ctx.fillStyle = '#10b981';
      ctx.fill();

      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [apple]);

  return (
    <div className="w-full h-full flex flex-col bg-[#07080a] overflow-hidden rounded-t-3xl border border-white/5 relative">
      
      {/* Simulation Screen */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        
        {/* Canvas Render screen */}
        <canvas 
          ref={canvasRef} 
          width={600} 
          height={320} 
          className="w-full h-full object-contain"
        />

        {/* HUD Data Matrix overlay */}
        <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-2">
          <div className="px-3 py-1.5 bg-[#0d0e12]/80 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 shadow-2xl">
            <Layers size={12} className="animate-pulse" /> 仿真雷达舱：在线
          </div>
          <div className="px-3 py-1.5 bg-[#0d0e12]/80 backdrop-blur-md border border-white/10 rounded-xl flex flex-col gap-1 text-[9px] font-mono text-gray-400 shadow-2xl">
            <div className="flex justify-between gap-4"><span>IR_LEFT:</span> <span className={sensorData.left < 100 ? 'text-red-400' : 'text-emerald-400'}>{sensorData.left}cm</span></div>
            <div className="flex justify-between gap-4"><span>IR_CENTER:</span> <span className={sensorData.center < 100 ? 'text-red-400' : 'text-emerald-400'}>{sensorData.center}cm</span></div>
            <div className="flex justify-between gap-4"><span>IR_RIGHT:</span> <span className={sensorData.right < 100 ? 'text-red-400' : 'text-emerald-400'}>{sensorData.right}cm</span></div>
          </div>
        </div>

        <div className="absolute top-4 right-4 pointer-events-none">
          <div className="px-3 py-1.5 bg-[#0d0e12]/80 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-1.5 text-[9px] font-black tracking-wider text-yellow-400 shadow-2xl">
            <Compass size={12} className="animate-spin-slow" /> SLAM 地图定位中
          </div>
        </div>

        {/* Interactive Speech bubble inside Canvas */}
        {bubbleText && (
          <div 
            className="absolute bg-blue-600 border border-blue-400 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-3xl animate-bounce pointer-events-none"
            style={{
              left: `${(botState.current.x / 600) * 100}%`,
              top: `${(botState.current.y / 320) * 100 - 15}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            {bubbleText}
            {/* arrow indicator */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-blue-600"></div>
          </div>
        )}

        {/* Sensor alert overlay */}
        {(sensorData.left < 80 || sensorData.center < 80 || sensorData.right < 80) && apple.active && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-600/25 border border-red-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 text-[9px] font-black text-red-400 tracking-wider animate-pulse">
            <ShieldAlert size={12} /> OBSTACLE_NEAR_ALERT
          </div>
        )}
      </div>

      {/* Sensor Control log Panel */}
      <div className="h-14 bg-black border-t border-white/5 px-6 flex items-center justify-between text-xs font-bold text-gray-500 font-mono">
        <div className="flex items-center gap-2 truncate pr-4">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
          <span className="text-gray-400 truncate">{status}</span>
        </div>
        <div className="text-[10px] text-gray-600 uppercase shrink-0">
          Bear.EAI Sim Engine v1.2
        </div>
      </div>

    </div>
  );
}
