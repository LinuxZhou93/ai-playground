import { create } from 'zustand';
import { db } from '../utils/database'; // 回退的 IndexedDB
import { useStageStore } from './stage';
import { createLogger } from '../logger';

const log = createLogger('LearningGitStore');

// 全局 Supabase 对象推导 (如果嵌在外部容器中)
function getGlobalSupabase() {
  if (typeof window !== 'undefined') {
    // @ts-ignore
    const client = window?.SupabaseClient?.client || window?.SubscriptionManager?.client;
    if (client) return client;
  }
  return null;
}

export interface LearningSnapshot {
  id: string; // 本地兼容
  user_id?: string;
  course_id: string;
  scene_index: number;
  ai_summary: string;
  notes: string;
  state_data: any; // JSONB
  created_at: number | string;
}

interface LearningGitState {
  isDrawerOpen: boolean;
  snapshots: LearningSnapshot[];
  currentNote: string;
  
  // Controls
  toggleDrawer: () => void;
  setDrawerOpen: (isOpen: boolean) => void;
  updateCurrentNote: (note: string) => void;
  saveCurrentNoteToCloud: () => Promise<void>;

  // Git Actions
  loadSnapshots: (courseId: string) => Promise<void>;
  createSnapshot: (courseId: string, sceneIndex: number, summary: string, stateData: any) => Promise<void>;
  checkoutSnapshot: (snapshotId: string) => void;
}

export const useLearningGitStore = create<LearningGitState>((set, get) => ({
  isDrawerOpen: false,
  snapshots: [],
  currentNote: '',

  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
  updateCurrentNote: (note) => set({ currentNote: note }),

  // 延时保存当前的输入笔记，防止手快卡死
  saveCurrentNoteToCloud: async () => {
    const snapshots = get().snapshots;
    if (!snapshots || snapshots.length === 0) return;
    
    // 我们永远默认更新最后一条或当前断点的快照
    const latestSnapshot = snapshots[0]; 
    const note = get().currentNote;
    const client = getGlobalSupabase();

    if (client) {
      try {
        const { data: { user } } = await client.auth.getUser();
        if (user) {
          await client.from('user_learning_snapshots')
            .update({ notes: note, updated_at: new Date().toISOString() })
            .eq('id', latestSnapshot.id)
            .eq('user_id', user.id);
        }
      } catch (err) {
        log.warn('Supabase Note Update Failed', err);
      }
    }
  },

  loadSnapshots: async (courseId) => {
    const client = getGlobalSupabase();
    if (client) {
      try {
        const { data: { user } } = await client.auth.getUser();
        if (user) {
          const { data, error } = await client
            .from('user_learning_snapshots')
            .select('*')
            .eq('course_id', courseId)
            // .eq('user_id', user.id) // RLS 已经处理隔离
            .order('created_at', { ascending: false });

          if (!error && data) {
            set({ snapshots: data as LearningSnapshot[], currentNote: data[0]?.notes || '' });
            return;
          }
        }
      } catch (err) {
        log.warn('Supabase Sync Failed, rolling back to offline memory', err);
      }
    }
    
    // 退化为 Dexie
    const localData = await db.learningSnapshots?.where('stageId').equals(courseId).reverse().sortBy('timestamp').catch(() => []);
    if (localData) {
       // 转换映射
       const mapped = localData.map((s: any) => ({
         id: s.id,
         course_id: s.stageId,
         scene_index: s.sceneIndex,
         ai_summary: s.aiSummary,
         notes: s.notes || '',
         state_data: { chatHistory: s.chatHistory },
         created_at: s.timestamp
       }));
       set({ snapshots: mapped, currentNote: mapped[0]?.notes || '' });
    }
  },

  createSnapshot: async (courseId, sceneIndex, summary, stateData) => {
    const client = getGlobalSupabase();
    const newId = crypto.randomUUID();
    const currentNote = get().currentNote;
    
    if (client) {
      try {
        const { data: { user } } = await client.auth.getUser();
        if (user) {
          await client.from('user_learning_snapshots').insert({
             id: newId,
             user_id: user.id,
             course_id: courseId,
             scene_index: sceneIndex,
             ai_summary: summary,
             notes: currentNote,
             state_data: stateData,
          });
          // 刷新数据
          await get().loadSnapshots(courseId);
          return;
        }
      } catch (err) {
        log.warn('Commit to cloud failed', err);
      }
    }

    // 离线存档
    try {
      if (db.learningSnapshots) {
        await db.learningSnapshots.put({
          id: newId,
          stageId: courseId,
          sceneIndex,
          aiSummary: summary,
          notes: currentNote,
          chatHistory: stateData?.chatHistory || [],
          timestamp: Date.now()
        });
        await get().loadSnapshots(courseId);
      }
    } catch {}
  },

  checkoutSnapshot: (snapshotId) => {
    const snap = get().snapshots.find(s => s.id === snapshotId);
    if (!snap) return;

    // 强行回到该幻灯片的生命周期
    const stageStore = useStageStore.getState();
    const scenes = stageStore.scenes;
    if (scenes && scenes[snap.scene_index]) {
       stageStore.setCurrentSceneId(scenes[snap.scene_index].id);
       // 若后续我们需要精准恢复聊天，可通过 snap.state_data 注入到 ChatArea 重新覆盖
       log.info(`[Edu-Git] Time-traveled directly to slide ${snap.scene_index} using Checkout logic.`);
    }
  }
}));
