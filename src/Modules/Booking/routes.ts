import { Router } from "express";
import { BookingController } from "./controller";
// import { authMiddleware } from "../../Middleware/Middleware";
import { ROUTES } from "../../Constants/constants";

import { authMiddleware, smartBodyParser } from '../../Middleware/Middleware.ts';

const router = Router();

router.get(ROUTES.BOOKINGS.AVAILABLE, BookingController.getAvailableSlots);
router.post(ROUTES.BOOKINGS.CREATE, smartBodyParser, authMiddleware, BookingController.book);
router.delete(`${ROUTES.BOOKINGS.CANCEL}/:id`, authMiddleware, BookingController.cancel);
router.get(ROUTES.BOOKINGS.HISTORY, authMiddleware, BookingController.history);

export default { path: ROUTES.BOOKINGS.ROOT, router };
