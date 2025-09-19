
import { Router, Request, Response } from "express";
import multer from "multer";

const router = Router();

// ========== Image Upload ========== //
const imageStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, "./public/img"),
    filename: (_req, file, cb) => {
        let filetype = file.mimetype.split("/")[1];
        const suffix = Math.floor(Math.random() * 10000);
        cb(null, `image-${Date.now()}-${suffix}.${filetype}`);
    },
});

const uploadImage = multer({ storage: imageStorage });

// ========== Document Upload ========== //
const documentStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, "./public/document"),
    filename: (_req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `document-${Date.now()}.${ext}`);
    },
});

const uploadDocument = multer({ storage: documentStorage });

// ========== Video Upload ========== //
const videoStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, "./public/videos"),
    filename: (_req, file, cb) => {
        const ext = file.originalname.split(".").pop();
        cb(null, `video-${Date.now()}.${ext}`);
    },
});

const uploadVideo = multer({ storage: videoStorage });

// ========== Audio Upload ========== //
const audioStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, "./public/audios"),
    filename: (_req, file, cb) => {
        const ext = file.originalname.split(".").pop();
        cb(null, `audio-${Date.now()}.${ext}`);
    },
});

const uploadAudio = multer({ storage: audioStorage });

// ========== Routes ========== //

router.post("/image", uploadImage.single("file"), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    res.json({
        success: true,
        filePath: `img/${req.file.filename}`,
        fileName: req.file.filename,
    });
});

router.post("/document", uploadDocument.single("file"), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    res.json({
        success: true,
        filePath: `document/${req.file.filename}`,
        fileName: req.file.filename,
    });
});

router.post("/video", uploadVideo.single("file"), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    res.json({
        success: true,
        filePath: `videos/${req.file.filename}`,
        fileName: req.file.filename,
    });
});

router.post("/audio", uploadAudio.single("file"), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    res.json({
        success: true,
        filePath: `audios/${req.file.filename}`,
        fileName: req.file.filename,
    });
});

router.post("/multiple-images", uploadImage.array("files"), (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
        return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const fileDetails = files.map((file) => ({
        filePath: `img/${file.filename}`,
        fileName: file.filename,
    }));

    res.json({
        success: true,
        files: fileDetails,
    });
});


export default {
    path: "/api/v1/upload",
    router,
};
