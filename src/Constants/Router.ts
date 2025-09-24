import { Router } from "express";
import authRoutes from "../Modules/Auth/routes";
import uploadRoutes from "../../src/Constants/uploads";
import slotsRoutes from "../Modules/Slots/routes";
import bookingRoutes from "../Modules/Booking/routes";

const router = Router();

router.use(authRoutes.path, authRoutes.router);
router.use(uploadRoutes.path, uploadRoutes.router);
router.use(slotsRoutes.path, slotsRoutes.router);
router.use(bookingRoutes.path, bookingRoutes.router);

export default router;
