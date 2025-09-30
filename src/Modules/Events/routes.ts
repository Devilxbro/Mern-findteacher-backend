import { Router } from "express";
import { EventController } from "./controller";
import { authMiddleware , smartBodyParser } from "../../Middleware/Middleware";
import { ROUTES } from "../../Constants/constants";

const router = Router();
const controller = EventController.getInstance();

router.get(ROUTES.EVENTS.LIST, authMiddleware, controller.listEvents.bind(controller));
router.post(ROUTES.EVENTS.CREATE, authMiddleware, smartBodyParser ,controller.createEvent.bind(controller));
router.get(`${ROUTES.EVENTS.DETAIL}/:id`, authMiddleware, controller.getEvent.bind(controller));
router.put(`${ROUTES.EVENTS.UPDATE}/:id`, authMiddleware, smartBodyParser,controller.updateEvent.bind(controller));
router.delete(`${ROUTES.EVENTS.DELETE}/:id`, authMiddleware, controller.deleteEvent.bind(controller));

export default { path: ROUTES.EVENTS.ROOT, router };
