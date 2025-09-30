import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureFolderExists = (folderPath: string) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
};

const createStorage = (folder: string) => {
    const fullPath = path.join(__dirname, "../../public", folder);
    ensureFolderExists(fullPath);

    return multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, fullPath),
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname);
            const name = path.basename(file.originalname, ext).replace(/\s/g, "-");
            const suffix = Date.now() + "-" + Math.floor(Math.random() * 10000);
            cb(null, `${name}-${suffix}${ext}`);
        },
    });
};

// Multer instance
export const upload = multer({ storage: createStorage("img") });

// Fields for qualification uploads
export const qualificationFields = upload.fields([
    { name: "degree", maxCount: 5 },
    { name: "diplomas", maxCount: 5 },
    { name: "certificate", maxCount: 5 },
    { name: "majorSubjects", maxCount: 5 },
]);
