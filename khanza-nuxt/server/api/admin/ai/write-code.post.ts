import { defineEventHandler, readBody } from 'h3';
import fs from 'node:fs';
import path from 'node:path';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const files = body.files;
    
    if (!Array.isArray(files) || files.length === 0) {
      return { success: false, message: 'Tidak ada file untuk ditulis' };
    }

    // Generate simple unique ID without external dependencies
    const backupId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9);
    const backupDir = path.join(process.cwd(), '.ai-backups', backupId);

    // 1. Buat direktori backup jika belum ada
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // 2. Tulis file dan buat backup file lama (jika ada)
    for (const file of files) {
      if (!file.path || !file.content) continue;
      
      const targetPath = path.join(process.cwd(), file.path);
      const targetDir = path.dirname(targetPath);
      
      // Pastikan direktori tujuan ada
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Jika file lama sudah ada, backup dulu
      if (fs.existsSync(targetPath)) {
        const oldContent = fs.readFileSync(targetPath, 'utf8');
        const backupFilePath = path.join(backupDir, file.path.replace(/\//g, '_'));
        fs.writeFileSync(backupFilePath, oldContent, 'utf8');
      } else {
        // Tandai file baru
        const backupFilePath = path.join(backupDir, file.path.replace(/\//g, '_') + '.isnew');
        fs.writeFileSync(backupFilePath, 'true', 'utf8');
      }
      
      // Suntikkan kode AI ke file system
      fs.writeFileSync(targetPath, file.content, 'utf8');
    }

    return {
      success: true,
      backupId,
      message: 'Kode berhasil diinjeksi ke sistem'
    };
    
  } catch (error: any) {
    console.error('[AI Write Code Error]', error);
    // Return standard 500 error but with clear message
    event.node.res.statusCode = 500;
    return {
      success: false,
      message: 'Server Error: ' + error.message
    };
  }
});
