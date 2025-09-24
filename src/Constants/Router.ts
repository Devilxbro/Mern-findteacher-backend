// src/Constants/Router.ts
import { Router } from "express";

import authRoutes from "../Modules/Auth/routes.ts";
import uploadRoutes from "../../src/Constants/uploads.ts";
import slotsRoutes from "../Modules/Slots/routes.ts"

const router = Router();

router.use(authRoutes.path, authRoutes.router);
router.use(uploadRoutes.path, uploadRoutes.router);
router.use(slotsRoutes.path, slotsRoutes.router )

export default router;
