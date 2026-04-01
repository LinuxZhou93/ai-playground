/**
 * Stage Storage Manager
 *
 * Manages multiple stage data in IndexedDB
 * Each stage has its own storage key based on stageId
 */

import { Stage, Scene } from '../types/stage';
import { ChatSession } from '../types/chat';
import { db } from './database';
import { saveChatSessions, loadChatSessions, deleteChatSessions } from './chat-storage';
import { clearPlaybackState } from './playback-storage';
import { createLogger } from '@/lib/logger';
import { supabase, getCurrentUser } from '../supabase';

const log = createLogger('StageStorage');

export interface StageStoreData {
  stage: Stage;
  scenes: Scene[];
  currentSceneId: string | null;
  chats: ChatSession[];
}

export interface StageListItem {
  id: string;
  name: string;
  description?: string;
  sceneCount: number;
  createdAt: number;
  updatedAt: number;
  isPublic?: boolean;
  isCloudOnly?: boolean;
  likes_count?: number;
  views_count?: number;
  forks_count?: number;
}

/**
 * Save stage data to IndexedDB
 */
export async function saveStageData(stageId: string, data: StageStoreData): Promise<void> {
  try {
    const now = Date.now();

    // Save to stages table
    await db.stages.put({
      id: stageId,
      name: data.stage.name || 'Untitled Stage',
      description: data.stage.description,
      createdAt: data.stage.createdAt || now,
      updatedAt: now,
      language: data.stage.language,
      style: data.stage.style,
      currentSceneId: data.currentSceneId || undefined,
      agentIds: data.stage.agentIds,
    });

    // Delete old scenes first to avoid orphaned data
    await db.scenes.where('stageId').equals(stageId).delete();

    // Save new scenes
    if (data.scenes && data.scenes.length > 0) {
      await db.scenes.bulkPut(
        data.scenes.map((scene, index) => ({
          ...scene,
          stageId,
          order: scene.order ?? index,
          createdAt: scene.createdAt || now,
          updatedAt: scene.updatedAt || now,
        })),
      );
    }

    // Save chat sessions to independent table
    if (data.chats) {
      await saveChatSessions(stageId, data.chats);
    }

    log.info(`Saved stage locally: ${stageId}`);

    // --- Cloud Sync (Supabase) ---
    const user = getCurrentUser();
    try {
      const { error: stageError } = await supabase.from('stages').upsert({
        id: stageId,
        name: data.stage.name || 'Untitled Stage',
        description: data.stage.description,
        created_at: data.stage.createdAt || now,
        updated_at: now,
        author_id: user ? user.id : 'anonymous', // 允许匿名同步
        is_public: data.stage.isPublic !== undefined ? data.stage.isPublic : true, // 默认公开，方便跨端直接访问
        language: data.stage.language,
        style: data.stage.style,
        whiteboard: data.stage.whiteboard || [],
        agent_ids: data.stage.agentIds,
      });

      if (stageError) throw stageError;

      // Sync scenes
      if (data.scenes && data.scenes.length > 0) {
        const { error: sceneError } = await supabase.from('scenes').upsert(
          data.scenes.map((scene, index) => ({
            id: scene.id,
            stage_id: stageId,
            type: scene.type,
            title: scene.title,
            display_order: scene.order ?? index,
            content: scene.content, // JSONB
            actions: scene.actions || [], // JSONB
            whiteboards: scene.whiteboards || [],
            multi_agent: scene.multiAgent || {},
            created_at: scene.createdAt || now,
            updated_at: now,
          })),
        );
        if (sceneError) throw sceneError;
      }

      log.info(`Synced stage to cloud: ${stageId}`);
    } catch (cloudError) {
      log.warn('Failed to sync to cloud (offline?):', cloudError);
    }
  } catch (error) {
    log.error('Failed to save stage:', error);
    throw error;
  }
}

/**
 * Load stage data from IndexedDB
 */
export async function loadStageData(stageId: string): Promise<StageStoreData | null> {
  try {
    // Load stage
    const stage = await db.stages.get(stageId);
    if (!stage) {
      log.info(`Stage not found: ${stageId}`);
      return null;
    }

    // Load scenes
    const scenes = await db.scenes.where('stageId').equals(stageId).sortBy('order');

    // Load chat sessions from independent table
    const chats = await loadChatSessions(stageId);

    log.info(`Loaded stage: ${stageId}, scenes: ${scenes.length}, chats: ${chats.length}`);

    return {
      stage,
      scenes,
      currentSceneId: stage.currentSceneId || scenes[0]?.id || null,
      chats,
    };
  } catch (error) {
    log.error('Failed to load stage:', error);
    return null;
  }
}

/**
 * Delete stage and all related data
 */
export async function deleteStageData(stageId: string): Promise<void> {
  try {
    // Delete stage
    await db.stages.delete(stageId);

    // Delete scenes
    await db.scenes.where('stageId').equals(stageId).delete();

    // Delete chat sessions and playback state
    await deleteChatSessions(stageId);
    await clearPlaybackState(stageId);

    log.info(`Deleted stage: ${stageId}`);
  } catch (error) {
    log.error('Failed to delete stage:', error);
    throw error;
  }
}

export async function listStages(): Promise<StageListItem[]> {
  try {
    const localStages = await db.stages.orderBy('updatedAt').reverse().toArray();

    // --- Cloud Pull (Supabase) ---
    const user = getCurrentUser();
    let cloudStages: any[] = [];
    if (user) {
        try {
            const { data, error } = await supabase
                .from('stages')
                .select('id, name, description, created_at, updated_at, is_public, likes_count, views_count, forks_count')
                .or(`author_id.eq.${user.id},is_public.eq.true`)
                .order('updated_at', { ascending: false });
            
            if (!error && data) {
                cloudStages = data;
            }
        } catch (err) {
            log.warn('Failed to pull stages from cloud:', err);
        }
    }

    // Merge logic (Local primary, but cloud provides new ones)
    const stageList: StageListItem[] = [];
    const localMap = new Map(localStages.map(s => [s.id, s]));
    
    // Add all local stages
    for (const stage of localStages) {
        const sceneCount = await db.scenes.where('stageId').equals(stage.id).count();
        stageList.push({
            id: stage.id,
            name: stage.name,
            description: stage.description,
            sceneCount,
            createdAt: stage.createdAt,
            updatedAt: stage.updatedAt,
            isPublic: stage.isPublic,
        });
    }

    // Add cloud stages NOT present locally (Forking/Sharing scenario)
    for (const remote of cloudStages) {
        if (!localMap.has(remote.id)) {
            stageList.push({
                id: remote.id,
                name: remote.name,
                description: remote.description,
                sceneCount: 0, // Not loaded yet
                createdAt: typeof remote.created_at === 'string' ? new Date(remote.created_at).getTime() : remote.created_at,
                updatedAt: typeof remote.updated_at === 'string' ? new Date(remote.updated_at).getTime() : remote.updated_at,
                isPublic: remote.is_public,
                isCloudOnly: true, // Special marker for UI
                likes_count: remote.likes_count,
                views_count: remote.views_count,
                forks_count: remote.forks_count,
            });
        }
    }

    // Sort by updatedAt
    return stageList.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    log.error('Failed to list stages:', error);
    return [];
  }
}

/**
 * Get first slide scene's canvas data for each stage (for thumbnail preview).
 * Also resolves gen_img_* placeholders from mediaFiles so thumbnails show real images.
 * Returns a map of stageId -> Slide (canvas data with resolved images)
 */
export async function getFirstSlideByStages(
  stageIds: string[],
): Promise<Record<string, import('../types/slides').Slide>> {
  const result: Record<string, import('../types/slides').Slide> = {};
  try {
    await Promise.all(
      stageIds.map(async (stageId) => {
        const scenes = await db.scenes.where('stageId').equals(stageId).sortBy('order');
        const firstSlide = scenes.find((s) => s.content?.type === 'slide');
        if (firstSlide && firstSlide.content.type === 'slide') {
          const slide = structuredClone(firstSlide.content.canvas);

          // Resolve gen_img_* placeholders from mediaFiles
          const placeholderEls = slide.elements.filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (el: any) => el.type === 'image' && /^gen_(img|vid)_[\w-]+$/i.test(el.src as string),
          );
          if (placeholderEls.length > 0) {
            const mediaRecords = await db.mediaFiles.where('stageId').equals(stageId).toArray();
            const mediaMap = new Map(
              mediaRecords.map((r) => {
                // Key format: stageId:elementId → extract elementId
                const elementId = r.id.includes(':') ? r.id.split(':').slice(1).join(':') : r.id;
                return [elementId, r.blob] as const;
              }),
            );
            for (const el of placeholderEls as Array<{ src: string }>) {
              const blob = mediaMap.get(el.src);
              if (blob) {
                el.src = URL.createObjectURL(blob);
              } else {
                // Clear unresolved placeholder so BaseImageElement won't subscribe
                // to the global media store (which may have stale data from another course)
                el.src = '';
              }
            }
          }

          result[stageId] = slide;
        }
      }),
    );
  } catch (error) {
    log.error('Failed to load thumbnails:', error);
  }
  return result;
}

/**
 * Check if stage exists
 */
export async function stageExists(stageId: string): Promise<boolean> {
  try {
    const stage = await db.stages.get(stageId);
    return !!stage;
  } catch (error) {
    log.error('Failed to check stage existence:', error);
    return false;
  }
}
