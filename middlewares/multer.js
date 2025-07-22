import multer from 'multer';

const storage = multer.memoryStorage(); // Ou votre configuration de stockage sur disque

// La configuration de multer
const upload = multer({
  storage: storage,
 
});

export { upload }; // <<< DOIT EXPORTER UPLOAD