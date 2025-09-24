import { Router } from "express";
import { SlotController } from "../Slots/controller.ts";
import { ROUTES } from "../../Constants/constants.ts";
import { authMiddleware } from "../../Middleware/Middleware.ts";

const router = Router();

/**
 * Slots Routes
 * Mounted under: /api/v1/slots
 * All routes are protected with authMiddleware
 */


router.post(ROUTES.SLOTS.CREATE, authMiddleware, SlotController.create);

router.get(ROUTES.SLOTS.LIST, authMiddleware, SlotController.list);


router.put(`${ROUTES.SLOTS.UPDATE}/:id`, authMiddleware, SlotController.update);

router.delete(`${ROUTES.SLOTS.DELETE}/:id`, authMiddleware, SlotController.remove);

export default { path: ROUTES.SLOTS.ROOT, router };
