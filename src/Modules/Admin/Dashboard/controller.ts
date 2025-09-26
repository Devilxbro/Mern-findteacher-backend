// src/controllers/analytics.controller.ts
import { Request, Response } from "express";
import { AnalyticsService } from "../Dashboard/services.ts";

export class AnalyticsController {
  private static instance: AnalyticsController;
  private analyticsService = AnalyticsService.getInstance();

  private constructor() {}

  public static getInstance(): AnalyticsController {
    if (!AnalyticsController.instance) {
      AnalyticsController.instance = new AnalyticsController();
    }
    return AnalyticsController.instance;
  }

  async getOverview(_req: Request, res: Response) {
    try {
      const result = await this.analyticsService.getOverview();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getUserGrowth(_req: Request, res: Response) {
    try {
      const result = await this.analyticsService.getUserGrowth();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getTeacherPerformance(_req: Request, res: Response) {
    try {
      const result = await this.analyticsService.getTeacherPerformance();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getSubscriptionStats(_req: Request, res: Response) {
    try {
      const result = await this.analyticsService.getSubscriptionStats();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getBookingsOverview(_req: Request, res: Response) {
    try {
      const result = await this.analyticsService.getBookingsOverview();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
