import { Request, Response } from "express";
import { AdminUserService } from "../userManagement/services";
import debug from "debug";

const log = debug("app:admin-user-controller");

export class AdminUserController {
  private static instance: AdminUserController;
  private service = AdminUserService.getInstance();

  private constructor() {}

  public static getInstance(): AdminUserController {
    if (!AdminUserController.instance) {
      AdminUserController.instance = new AdminUserController();
    }
    return AdminUserController.instance;
  }

  async listUsers(req: Request, res: Response) {
    log("listUsers called with query:", req.query);
    try {
      const data = await this.service.listUsers(req.query);
      log("listUsers result:", data);
      res.json({ success: true, data });
    } catch (err: any) {
      log("listUsers error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getUser(req: Request, res: Response) {
    log("getUser called with id:", req.params.id);
    try {
      const data = await this.service.getUserById(req.params.id);
      log("getUser result:", data);
      res.json({ success: true, data });
    } catch (err: any) {
      log("getUser error:", err);
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    log("updateStatus called with id:", req.params.id, "body:", req.body);
    try {
      const data = await this.service.updateStatus(req.params.id, req.body.isActive);
      log("updateStatus result:", data);
      res.json({ success: true, data });
    } catch (err: any) {
      log("updateStatus error:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async deleteUser(req: Request, res: Response) {
    log("deleteUser called with id:", req.params.id);
    try {
      const result = await this.service.deleteUser(req.params.id);
      log("deleteUser result:", result);
      res.json({ success: true, message: "User deleted successfully" });
    } catch (err: any) {
      log("deleteUser error:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getBookings(req: Request, res: Response) {
    log("getBookings called with id:", req.params.id);
    try {
      const data = await this.service.getUserBookings(req.params.id);
      log("getBookings result:", data);
      res.json({ success: true, data });
    } catch (err: any) {
      log("getBookings error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getPayments(req: Request, res: Response) {
    log("getPayments called with id:", req.params.id);
    try {
      const data = await this.service.getUserPayments(req.params.id);
      log("getPayments result:", data);
      res.json({ success: true, data });
    } catch (err: any) {
      log("getPayments error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getActive(_req: Request, res: Response) {
    log("getActive called");
    try {
      const data = await this.service.getActiveUsers();
      log("getActive result:", data);
      res.json({ success: true, data });
    } catch (err: any) {
      log("getActive error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getFeedback(_req: Request, res: Response) {
    log("getFeedback called");
    try {
      const data = await this.service.getUserFeedback();
      log("getFeedback result:", data);
      res.json({ success: true, data });
    } catch (err: any) {
      log("getFeedback error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async exportData(_req: Request, res: Response) {
    log("exportData called");
    try {
      const data = await this.service.exportUserData();
      log("exportData result:", data.length, "users exported");
      res.json({ success: true, data });
    } catch (err: any) {
      log("exportData error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
