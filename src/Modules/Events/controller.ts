import { Response } from "express";
import { AuthRequest } from "../../Middleware/Middleware.ts"; // path to your middleware file
import { EventService } from "./services.ts";
import debug from "debug";

const log = debug("app:event-controller");
const service = EventService.getInstance();

export class EventController {
    private static instance: EventController;

    private constructor() {}
    public static getInstance() {
        if (!EventController.instance) EventController.instance = new EventController();
        return EventController.instance;
    }

    // Use AuthRequest instead of Request
    async createEvent(req: AuthRequest, res: Response) {
        try {
            if (!req.user?.userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const data = await service.createEvent({
                ...req.body,
                createdBy: req.user.userId, // TypeScript now knows this exists
            });

            res.json({ success: true, data });
        } catch (err: any) {
            log(err);
            res.status(400).json({ success: false, message: err.message });
        }
    }
  async getUpcomingEvents(req: AuthRequest, res: Response) {
    try {
      const data = await service.getUpcomingEvents(req.query);
      res.json({ success: true, data });
    } catch (err: any) {
      log(err);
      res.status(500).json({ success: false, message: err.message });
    }
  }


  async listEvents(req: AuthRequest, res: Response) {
        try {
            const data = await service.listEvents(req.query);
            res.json({ success: true, data });
        } catch (err: any) {
            log(err);
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async getEvent(req: AuthRequest, res: Response) {
        try {
            const data = await service.getEventById(req.params.id);
            res.json({ success: true, data });
        } catch (err: any) {
            log(err);
            res.status(404).json({ success: false, message: err.message });
        }
    }

    async updateEvent(req: AuthRequest, res: Response) {
        try {
            const data = await service.updateEvent(req.params.id, req.body);
            res.json({ success: true, data });
        } catch (err: any) {
            log(err);
            res.status(400).json({ success: false, message: err.message });
        }
    }

    async deleteEvent(req: AuthRequest, res: Response) {
        try {
            await service.deleteEvent(req.params.id);
            res.json({ success: true, message: "Event deleted successfully" });
        } catch (err: any) {
            log(err);
            res.status(400).json({ success: false, message: err.message });
        }
    }
}
