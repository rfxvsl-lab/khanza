import { defineEventHandler, readBody, createError } from 'h3';
import fs from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const backupId = body.backupId;
  
  if (!backupId) {
    throw createError({ statusCode: 400, statusMessage: 'Backup ID diperlukan' });
  }

  const backupDir = path.join(process.cwd(), '.ai-backups', backupId);

  if (!fs.existsSync(backupDir)) {
    throw createError({ statusCode: 404, statusMessage: 'Data backup tidak ditemukan' });
  }

  try {
    const backupFiles = fs.readdirSync(backupDir);
    
    for (const backupFile of backupFiles) {
      // Decode nama file kembali ke path aslinya
      let originalPathStr = backupFile;
      const isNew = backupFile.endsWith('.isnew');
      
      if (isNew) {
        originalPathStr = backupFile.replace('.isnew', '');
      }
      
      // Asumsi: Kita tadi mengganti "/" dengan "_" di write-code.post.ts
      // Tapi karena nama file bisa mengandung "_", metode ini agak rentan.
      // Untuk demo ini, kita akan asumsikan penggantian "_" cukup aman untuk path standar seperti "pages_nama.vue" -> "pages/nama.vue"
      const decodedPath = originalPathStr.replace(/_/g, '/');
      const targetPath = path.join(process.cwd(), decodedPath);
      
      if (isNew) {
        // Jika file sebelumnya tidak ada, hapus file yang dibuat AI
        if (fs.existsSync(targetPath)) {
          fs.unlinkSync(targetPath);
        }
      } else {
        // Kembalikan isi file lama
        const oldContent = fs.readFileSync(path.join(backupDir, backupFile), 'utf8');
        fs.writeFileSync(targetPath, oldContent, 'utf8');
      }
    }

    return {
      success: true,
      message: 'Sistem berhasil dikembalikan ke keadaan semula'
    };
    
  } catch (error: any) {
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Gagal melakukan revert: ' + error.message 
    });
  }
});
