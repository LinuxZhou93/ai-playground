import { promises as fs } from 'fs';
import path from 'path';
import { CLASSROOMS_DIR, readClassroom, type PersistedClassroomData } from './classroom-storage';
import { createLogger } from '@/lib/logger';

const log = createLogger('Export');

export interface PortablePackage {
  version: '1.0';
  timestamp: string;
  data: PersistedClassroomData;
  metadata: {
    source: string;
    hasVideoTranscript: boolean;
  };
}

/**
 * 课件包导出工具：生成可移植的 JSON 包
 */
export async function exportClassroomPackage(id: string): Promise<PortablePackage | null> {
  try {
    const classroom = await readClassroom(id);
    if (!classroom) return null;

    const pkg: PortablePackage = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: classroom,
      metadata: {
        source: 'FutureClass-MAIC',
        hasVideoTranscript: classroom.scenes.some(s => {
          const content = s.content as any;
          return content.canvas?.description?.includes('[全量视频转录内容]');
        })
      }
    };

    return pkg;
  } catch (e) {
    log.error(`Failed to export classroom ${id}:`, e);
    return null;
  }
}

/**
 * 将课件导出为本地文件 (供下载或集成使用)
 */
export async function savePackageToFile(id: string, outDir: string): Promise<string | null> {
  const pkg = await exportClassroomPackage(id);
  if (!pkg) return null;

  await fs.mkdir(outDir, { recursive: true });
  const fileName = `futureclass-${id}.json`;
  const filePath = path.join(outDir, fileName);
  
  await fs.writeFile(filePath, JSON.stringify(pkg, null, 2), 'utf-8');
  log.info(`Classroom ${id} exported to ${filePath}`);
  return filePath;
}
