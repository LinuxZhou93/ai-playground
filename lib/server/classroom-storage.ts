import type { NextRequest } from 'next/server';
import type { Scene, Stage } from '@/lib/types/stage';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';

const log = createLogger('ClassroomStorage');

export function buildRequestOrigin(req: NextRequest): string {
  return req.headers.get('x-forwarded-host')
    ? `${req.headers.get('x-forwarded-proto') || 'http'}://${req.headers.get('x-forwarded-host')}`
    : req.nextUrl.origin;
}

export interface PersistedClassroomData {
  id: string;
  stage: Stage;
  scenes: Scene[];
  createdAt: string;
}

export function isValidClassroomId(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

export async function readClassroom(id: string): Promise<PersistedClassroomData | null> {
  try {
    const { data: stageRecord, error: stageError } = await supabase
      .from('stages')
      .select('*')
      .eq('id', id)
      .single();

    if (stageError || !stageRecord) {
      log.warn(`Classroom stage not found in Supabase: ${id}`, stageError);
      return null;
    }

    const { data: scenesRecords, error: scenesError } = await supabase
      .from('scenes')
      .select('*')
      .eq('stage_id', id)
      .order('display_order', { ascending: true });

    if (scenesError) {
      log.warn(`Error fetching scenes for classroom ${id}:`, scenesError);
    }

    const stage: Stage = {
      id: stageRecord.id,
      name: stageRecord.name,
      description: stageRecord.description || undefined,
      language: stageRecord.language || undefined,
      style: stageRecord.style || undefined,
      agentIds: stageRecord.agent_ids,
      whiteboard: stageRecord.whiteboard,
      authorId: stageRecord.author_id || undefined,
      isPublic: stageRecord.is_public,
      forkedFrom: stageRecord.forked_from || undefined,
      likesCount: stageRecord.likes_count,
      viewsCount: stageRecord.views_count,
      forksCount: stageRecord.forks_count,
      createdAt: Number(stageRecord.created_at),
      updatedAt: Number(stageRecord.updated_at),
    };

    const scenes: Scene[] = (scenesRecords || []).map((row: any) => ({
      id: row.id,
      stageId: row.stage_id,
      type: row.type as any,
      title: row.title,
      order: row.display_order,
      content: row.content,
      actions: row.actions,
      whiteboards: row.whiteboards,
      multiAgent: row.multi_agent,
      createdAt: Number(row.created_at) || undefined,
      updatedAt: Number(row.updated_at) || undefined,
    }));

    return {
      id,
      stage,
      scenes,
      createdAt: new Date(Number(stageRecord.created_at)).toISOString(),
    };
  } catch (error) {
    log.error('Failed reading classroom from Supabase:', error);
    throw error;
  }
}

export async function persistClassroom(
  data: {
    id: string;
    stage: Stage;
    scenes: Scene[];
  },
  baseUrl: string,
): Promise<PersistedClassroomData & { url: string }> {
  const currentTimestamp = Date.now();
  
  const stagePayload = {
    id: data.stage.id,
    name: data.stage.name,
    description: data.stage.description || null,
    language: data.stage.language || null,
    style: data.stage.style || null,
    agent_ids: data.stage.agentIds || [],
    whiteboard: data.stage.whiteboard || [],
    author_id: data.stage.authorId || null,
    is_public: data.stage.isPublic || false,
    forked_from: data.stage.forkedFrom || null,
    likes_count: data.stage.likesCount || 0,
    views_count: data.stage.viewsCount || 0,
    forks_count: data.stage.forksCount || 0,
    created_at: data.stage.createdAt || currentTimestamp,
    updated_at: data.stage.updatedAt || currentTimestamp,
  };

  const { error: stageError } = await supabase.from('stages').upsert(stagePayload);
  if (stageError) {
    log.error('Failed saving stage to Supabase:', stageError);
    throw new Error(`Stage insert error: ${stageError.message}`);
  }

  const scenesPayload = data.scenes.map((scene) => ({
    id: scene.id,
    stage_id: scene.stageId,
    type: scene.type,
    title: scene.title,
    display_order: scene.order,
    content: scene.content,
    actions: scene.actions || [],
    whiteboards: scene.whiteboards || [],
    multi_agent: scene.multiAgent || {},
    created_at: scene.createdAt || currentTimestamp,
    updated_at: scene.updatedAt || currentTimestamp,
  }));

  if (scenesPayload.length > 0) {
    const { error: scenesError } = await supabase.from('scenes').upsert(scenesPayload);
    if (scenesError) {
      log.error('Failed saving scenes to Supabase:', scenesError);
      throw new Error(`Scenes insert error: ${scenesError.message}`);
    }
  }

  const classroomData: PersistedClassroomData = {
    id: data.id,
    stage: data.stage,
    scenes: data.scenes,
    createdAt: new Date(currentTimestamp).toISOString(),
  };

  return {
    ...classroomData,
    url: `${baseUrl}/classroom/${data.id}`,
  };
}
