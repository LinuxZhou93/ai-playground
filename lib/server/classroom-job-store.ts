import type {
  ClassroomGenerationProgress,
  ClassroomGenerationStep,
  GenerateClassroomInput,
  GenerateClassroomResult,
} from '@/lib/server/classroom-generation';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';

const log = createLogger('ClassroomJobStore');

export type ClassroomGenerationJobStatus = 'queued' | 'running' | 'succeeded' | 'failed';

export interface ClassroomGenerationJob {
  id: string;
  status: ClassroomGenerationJobStatus;
  step: ClassroomGenerationStep | 'queued' | 'failed';
  progress: number;
  message: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  inputSummary: {
    requirementPreview: string;
    language: string;
    hasPdf: boolean;
    pdfTextLength: number;
    pdfImageCount: number;
  };
  scenesGenerated: number;
  totalScenes?: number;
  result?: {
    classroomId: string;
    url: string;
    scenesCount: number;
  };
  error?: string;
}

function buildInputSummary(input: GenerateClassroomInput): ClassroomGenerationJob['inputSummary'] {
  return {
    requirementPreview:
      input.requirement.length > 200 ? `${input.requirement.slice(0, 197)}...` : input.requirement,
    language: input.language || 'zh-CN',
    hasPdf: !!input.pdfContent,
    pdfTextLength: input.pdfContent?.text.length || 0,
    pdfImageCount: input.pdfContent?.images.length || 0,
  };
}

/** Max age (ms) before a "running" job without an active runner is considered stale. */
const STALE_JOB_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

function markStaleIfNeeded(job: ClassroomGenerationJob): ClassroomGenerationJob {
  if (job.status !== 'running') return job;
  const updatedAt = new Date(job.updatedAt).getTime();
  if (Date.now() - updatedAt > STALE_JOB_TIMEOUT_MS) {
    return {
      ...job,
      status: 'failed',
      step: 'failed',
      message: 'Job appears stale (no progress update for 30 minutes)',
      error: 'Stale job: process may have restarted during generation',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  return job;
}

export function isValidClassroomJobId(jobId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(jobId);
}

// Convert DB row to TS object
function mapDbToJob(row: any): ClassroomGenerationJob {
  return {
    id: row.id,
    status: row.status as ClassroomGenerationJobStatus,
    step: row.step as ClassroomGenerationJob['step'],
    progress: row.progress,
    message: row.message || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    startedAt: row.started_at || undefined,
    completedAt: row.completed_at || undefined,
    inputSummary: row.input_summary || {},
    scenesGenerated: row.scenes_generated || 0,
    totalScenes: row.total_scenes || undefined,
    result: row.result || undefined,
    error: row.error || undefined,
  };
}

export async function createClassroomGenerationJob(
  jobId: string,
  input: GenerateClassroomInput,
): Promise<ClassroomGenerationJob> {
  const now = new Date().toISOString();
  const job: ClassroomGenerationJob = {
    id: jobId,
    status: 'queued',
    step: 'queued',
    progress: 0,
    message: 'Classroom generation job queued',
    createdAt: now,
    updatedAt: now,
    inputSummary: buildInputSummary(input),
    scenesGenerated: 0,
  };

  const payload = {
    id: job.id,
    status: job.status,
    step: job.step,
    progress: job.progress,
    message: job.message,
    created_at: job.createdAt,
    updated_at: job.updatedAt,
    input_summary: job.inputSummary,
    scenes_generated: job.scenesGenerated,
  };

  const { error } = await supabase.from('classroom_jobs').insert(payload);
  if (error) {
    log.error(`Failed to create job ${jobId} in Supabase:`, error);
    throw new Error(`Job insert error: ${error.message}`);
  }

  return job;
}

export async function readClassroomGenerationJob(
  jobId: string,
): Promise<ClassroomGenerationJob | null> {
  const { data, error } = await supabase
    .from('classroom_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error || !data) {
    // If not found, return null
    if (error?.code !== 'PGRST116') {
      log.warn(`Error reading job ${jobId}:`, error);
    }
    return null;
  }

  return markStaleIfNeeded(mapDbToJob(data));
}

export async function updateClassroomGenerationJob(
  jobId: string,
  patch: Partial<ClassroomGenerationJob>,
): Promise<ClassroomGenerationJob> {
  const existing = await readClassroomGenerationJob(jobId);
  if (!existing) {
    throw new Error(`Classroom generation job not found: ${jobId}`);
  }

  const updated: ClassroomGenerationJob = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  const payload = {
    status: updated.status,
    step: updated.step,
    progress: updated.progress,
    message: updated.message,
    updated_at: updated.updatedAt,
    started_at: updated.startedAt,
    completed_at: updated.completedAt,
    input_summary: updated.inputSummary,
    scenes_generated: updated.scenesGenerated,
    total_scenes: updated.totalScenes,
    result: updated.result,
    error: updated.error,
  };

  const { error } = await supabase
    .from('classroom_jobs')
    .update(payload)
    .eq('id', jobId);

  if (error) {
    log.error(`Failed to update job ${jobId}:`, error);
    throw new Error(`Job update error: ${error.message}`);
  }

  return updated;
}

export async function markClassroomGenerationJobRunning(
  jobId: string,
): Promise<ClassroomGenerationJob> {
  return updateClassroomGenerationJob(jobId, {
    status: 'running',
    startedAt: new Date().toISOString(),
    message: 'Classroom generation started',
  });
}

export async function updateClassroomGenerationJobProgress(
  jobId: string,
  progress: ClassroomGenerationProgress,
): Promise<ClassroomGenerationJob> {
  return updateClassroomGenerationJob(jobId, {
    status: 'running',
    step: progress.step,
    progress: progress.progress,
    message: progress.message,
    scenesGenerated: progress.scenesGenerated,
    totalScenes: progress.totalScenes,
  });
}

export async function markClassroomGenerationJobSucceeded(
  jobId: string,
  result: GenerateClassroomResult,
): Promise<ClassroomGenerationJob> {
  return updateClassroomGenerationJob(jobId, {
    status: 'succeeded',
    step: 'completed',
    progress: 100,
    message: 'Classroom generation completed',
    completedAt: new Date().toISOString(),
    scenesGenerated: result.scenesCount,
    result: {
      classroomId: result.id,
      url: result.url,
      scenesCount: result.scenesCount,
    },
  });
}

export async function markClassroomGenerationJobFailed(
  jobId: string,
  error: string,
): Promise<ClassroomGenerationJob> {
  return updateClassroomGenerationJob(jobId, {
    status: 'failed',
    step: 'failed',
    message: 'Classroom generation failed',
    completedAt: new Date().toISOString(),
    error,
  });
}
