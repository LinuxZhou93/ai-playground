'use client';

import { Stage } from '@/components/stage';
import { ThemeProvider } from '@/lib/hooks/use-theme';
import { useStageStore } from '@/lib/store';
import { useEffect, useRef, useState } from 'react';
import { MediaStageProvider } from '@/lib/contexts/media-stage-context';
import type { PortablePackage } from '@/lib/server/classroom-export';

interface PortableClassroomProps {
  /** 
   * 注入导出的课件包对象。
   * 如果提供此项，组件将直接渲染该包内容，忽略数据库加载。
   */
  packageData?: PortablePackage;
  /**
   * 或者提供 classroomId 从本地数据库或 API 加载。
   */
  classroomId?: string;
  onSceneChange?: (sceneId: string) => void;
}

/**
 * PortableClassroom: 高度模块化的课件渲染组件。
 * 核心目标是支持一键集成到外部 Web 项目。
 */
export function PortableClassroom({ packageData, classroomId, onSceneChange }: PortableClassroomProps) {
  const { setStage, setScenes, setCurrentSceneId } = useStageStore();
  const [ready, setReady] = useState(false);
  const onSceneChangeRef = useRef(onSceneChange);
  onSceneChangeRef.current = onSceneChange;

  useEffect(() => {
    if (packageData) {
      // 模式 A: 直接通过属性注入数据 (无感集成)
      const { stage, scenes } = packageData.data;
      setStage(stage);
      setScenes(scenes);
      setCurrentSceneId(scenes[0]?.id || null);
      setReady(true);
    } else if (classroomId) {
      // 模式 B: 通过 ID 加载 (保持原有链路)
      setReady(true);
    }
  }, [packageData, classroomId, setStage, setScenes, setCurrentSceneId]);

  // 通过 store 订阅场景变化，触发外部回调
  useEffect(() => {
    if (!onSceneChangeRef.current) return;
    const unsub = useStageStore.subscribe(
      (state, prevState) => {
        if (state.currentSceneId && state.currentSceneId !== prevState.currentSceneId) {
          onSceneChangeRef.current?.(state.currentSceneId);
        }
      }
    );
    return unsub;
  }, []);

  if (!ready) return <div>Loading courseware...</div>;

  return (
    <ThemeProvider>
      <MediaStageProvider value={classroomId || packageData?.data.id || 'portable'}>
        <div className="portable-classroom-container h-full w-full overflow-hidden">
          <Stage />
        </div>
      </MediaStageProvider>
    </ThemeProvider>
  );
}
