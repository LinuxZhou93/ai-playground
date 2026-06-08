/**
 * FutureClass 自动净化与全域垃圾回收脚本 (cleanup.js)
 * 
 * 核心功能：
 * 1. 递归扫描并清理全域 macOS 扩展属性垃圾文件 (._*)。
 * 2. 扫描 public/resources/ 下的临时自动生成文件 (auto-*.html / hub-auto-*.html)，
 *    自动将其转移至归档目录 (public/resources/archive/)，以清空开发区。
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const RESOURCES_DIR = path.join(PROJECT_ROOT, 'public', 'resources');
const ARCHIVE_DIR = path.join(RESOURCES_DIR, 'archive');

console.log('🚀 [Titan Clean] 启动 FutureClass 全域净化与维护程序...');

// 确保归档目录存在
if (!fs.existsSync(ARCHIVE_DIR)) {
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
}

let deletedGarbageCount = 0;
let archivedHtmlCount = 0;

/**
 * 递归删除以 ._ 开头的垃圾文件
 */
function cleanGarbageFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      cleanGarbageFiles(fullPath);
    } else if (stat.isFile() && item.startsWith('._')) {
      try {
        fs.unlinkSync(fullPath);
        deletedGarbageCount++;
      } catch (err) {
        console.error(`❌ [Titan Clean] 无法删除文件 ${fullPath}:`, err.message);
      }
    }
  }
}

/**
 * 回收与归档临时生成的大模型课堂 HTML 页面
 */
function archiveTemporaryHtmlFiles() {
  if (!fs.existsSync(RESOURCES_DIR)) return;
  const list = fs.readdirSync(RESOURCES_DIR);
  
  for (const item of list) {
    const fullPath = path.join(RESOURCES_DIR, item);
    
    // 只处理位于 resources 根路径下的 auto-*.html / hub-auto-*.html 文件
    const isTempHtml = (item.startsWith('auto-') || item.startsWith('hub-auto-')) && item.endsWith('.html');
    
    if (isTempHtml) {
      const destPath = path.join(ARCHIVE_DIR, item);
      try {
        fs.renameSync(fullPath, destPath);
        archivedHtmlCount++;
      } catch (err) {
        console.error(`❌ [Titan Clean] 归档文件 ${item} 失败:`, err.message);
      }
    }
  }
}

// 1. 开始清理 macOS 垃圾文件
console.log('🧹 正在扫描并净化 macOS 扩展属性垃圾 (._*)...');
cleanGarbageFiles(PROJECT_ROOT);
console.log(`✅ macOS 垃圾文件清理完成！共删除 ${deletedGarbageCount} 个文件。`);

// 2. 开始回收临时生成 HTML
console.log('📦 正在扫描并归档 AI 临时生成的静态 HTML 课堂...');
archiveTemporaryHtmlFiles();
console.log(`✅ 临时 HTML 课件归档完成！共归档 ${archivedHtmlCount} 个课件至 public/resources/archive/ 目录下。`);

console.log('✨ [Titan Clean] 维护程序运行结束。项目已恢复洁净！\n');
