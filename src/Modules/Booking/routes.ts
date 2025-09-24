import { Router } from "express";
import { BookingController } from "./controller";
import { authMiddleware } from "../../Middleware/Middleware";
import { ROUTES } from "../../Constants/constants";

const router = Router();

router.get(ROUTES.BOOKINGS.AVAILABLE, BookingController.getAvailableSlots);
router.post(ROUTES.BOOKINGS.CREATE, authMiddleware, BookingController.book);
router.delete(`${ROUTES.BOOKINGS.CANCEL}/:id`, authMiddleware, BookingController.cancel);

export default { path: ROUTES.BOOKINGS.ROOT, router };
