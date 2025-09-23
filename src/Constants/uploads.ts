import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========== Storage Configurations ========== //
const createStorage = (folder: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, `./public/${folder}`),
    filename: (_req, file, cb) => {
      const ext = file.originalname.split(".").pop();
      const suffix = Math.floor(Math.random() * 10000);
      cb(null, `${folder}-${Date.now()}-${suffix}.${ext}`);
    },
  });

const uploadImage = multer({ storage: createStorage("img") });
const uploadDocument = multer({ storage: createStorage("document") });
const uploadVideo = multer({ storage: createStorage("videos") });
const uploadAudio = multer({ storage: createStorage("audios") });

// ========== Helper ========== //
const sendFileIfExists = (
  res: Response,
  folder: string,
  filename: string
) => {
  const filePath = path.join(__dirname, `../../public/${folder}`, filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res
      .status(404)
      .json({ success: false, message: "File not found" });
  }
};

// ========== Upload Routes ========== //
router.post("/image", uploadImage.single("file"), (req: Request, res: Response) => {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  res.json({
    success: true,
    filePath: `img/${req.file.filename}`,
    fileName: req.file.filename,
  });
});

router.post("/document", uploadDocument.single("file"), (req: Request, res: Response) => {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  res.json({
    success: true,
    filePath: `document/${req.file.filename}`,
    fileName: req.file.filename,
  });
});

router.post("/video", uploadVideo.single("file"), (req: Request, res: Response) => {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  res.json({
    success: true,
    filePath: `videos/${req.file.filename}`,
    fileName: req.file.filename,
  });
});

router.post("/audio", uploadAudio.single("file"), (req: Request, res: Response) => {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  res.json({
    success: true,
    filePath: `audios/${req.file.filename}`,
    fileName: req.file.filename,
  });
});

router.post("/multiple-images", uploadImage.array("files"), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0)
    return res
      .status(400)
      .json({ success: false, message: "No files uploaded" });

  const fileDetails = files.map((file) => ({
    filePath: `img/${file.filename}`,
    fileName: file.filename,
  }));
  res.json({ success: true, files: fileDetails });
});

// ========== GET Routes ========== //
// Example: /api/v1/upload/image/img/<filename>
router.get("/:type/:folder/:filename", (req: Request, res: Response) => {
  const { type, folder, filename } = req.params;

  const validMap: Record<string, string> = {
    image: "img",
    document: "document",
    video: "videos",
    audio: "audios",
  };

  if (!validMap[type] || validMap[type] !== folder) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid path" });
  }

  sendFileIfExists(res, folder, filename);
});

export default {
  path: "/api/v1/upload",
  router,
};
