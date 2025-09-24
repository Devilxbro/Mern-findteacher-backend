
import { Request, Response } from "express";
import { SlotService } from "./services";
import { AuthRequest } from "../../Middleware/Middleware.ts";

const slotService = SlotService.getInstance();

export class SlotController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const teacherId = req.user?.userId;
      if (!teacherId) return res.status(401).json({ error: "Unauthorized" });

      const slot = await slotService.createSlot({ ...req.body, teacherId });
      return res.status(201).json({ success: true, slot });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const { teacherId } = req.query;
      const slots = await slotService.getSlots({ teacherId: teacherId as string });
      return res.status(200).json({ success: true, slots });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const teacherId = req.user?.userId;
      if (!teacherId) return res.status(401).json({ error: "Unauthorized" });

      const slot = await slotService.updateSlot(req.params.id, teacherId, req.body);
      return res.status(200).json({ success: true, slot });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  static async remove(req: AuthRequest, res: Response) {
    try {
      const teacherId = req.user?.userId;
      if (!teacherId) return res.status(401).json({ error: "Unauthorized" });

      const result = await slotService.deleteSlot(req.params.id, teacherId);
      return res.status(200).json({ success: true, result });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}
