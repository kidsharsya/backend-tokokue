import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper untuk mendapatkan __dirname di ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  // Tentukan folder tujuan untuk menyimpan file
  destination: (req, file, cb) => {
    // Pastikan folder 'public/images' sudah ada
    cb(null, path.join(__dirname, '../public/images'));
  },
  // Buat nama file yang unik untuk menghindari konflik nama
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Inisialisasi multer dengan konfigurasi storage
const upload = multer({ storage: storage });

export default upload;
