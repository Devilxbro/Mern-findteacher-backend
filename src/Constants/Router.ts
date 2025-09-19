// src/Constants/Router.ts
import { Router } from "express";

import authRoutes from "../Modules/Auth/routes.js.ts";
import uploadRoutes from "../../src/Constants/uploads.ts"; // ✅ Add this

const router = Router();

router.use(authRoutes.path, authRoutes.router);
router.use(uploadRoutes.path, uploadRoutes.router); // ✅ Register upload routes

export default router;
