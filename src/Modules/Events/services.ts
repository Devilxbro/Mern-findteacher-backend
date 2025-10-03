import { EventModel } from "../../Db/entities/Events.ts";
import { Types } from "mongoose";
import debug from "debug";

const log = debug("app:event-service");

export class EventService {
    private static instance: EventService;

    private constructor() {}

    public static getInstance() {
        if (!EventService.instance) EventService.instance = new EventService();
        return EventService.instance;
    }

    async createEvent(data: any) {
        log("Creating event:", data);
        const event = await EventModel.create(data);
        return event;
    }

    async listEvents(filter: any = {}) {
        const page = parseInt(filter.page || "1", 10);
        const limit = parseInt(filter.limit || "10", 10);
        const skip = (page - 1) * limit;

        const query: any = {};
        if (filter.isActive !== undefined) query.isActive = filter.isActive === "true";
        if (filter.startDate) query.startDate = { $gte: new Date(filter.startDate) };
        if (filter.endDate) query.endDate = { $lte: new Date(filter.endDate) };

        log("listEvents query:", query);

        const [events, total] = await Promise.all([
            EventModel.find(query).sort({ startDate: 1 }).skip(skip).limit(limit).lean(),
            EventModel.countDocuments(query),
        ]);

        const totalPages = Math.ceil(total / limit);
        const nextPage = page < totalPages ? page + 1 : null;

        return { events, total, page, totalPages, nextPage };
    }

    async getEventById(id: string) {
        if (!Types.ObjectId.isValid(id)) throw new Error("Invalid ID");
        const event = await EventModel.findById(id).lean();
        if (!event) throw new Error("Event not found");
        return event;
    }

    async updateEvent(id: string, data: any) {
        if (!Types.ObjectId.isValid(id)) throw new Error("Invalid ID");
        const event = await EventModel.findByIdAndUpdate(id, data, { new: true });
        if (!event) throw new Error("Event not found");
        return event;
    }
  async getUpcomingEvents(filter: any = {}) {
    const page = parseInt(filter.page || "1", 10);
    const limit = parseInt(filter.limit || "10", 10);
    const skip = (page - 1) * limit;

    const now = new Date();

    const query: any = {
      startDate: { $gte: now }, // only future events
    };

    if (filter.isActive !== undefined) query.isActive = filter.isActive === "true";

    const [events, total] = await Promise.all([
      EventModel.find(query).sort({ startDate: 1 }).skip(skip).limit(limit).lean(),
      EventModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);
    const nextPage = page < totalPages ? page + 1 : null;

    return { events, total, page, totalPages, nextPage };
  }


  async deleteEvent(id: string) {
        if (!Types.ObjectId.isValid(id)) throw new Error("Invalid ID");
        const deleted = await EventModel.findByIdAndDelete(id);
        if (!deleted) throw new Error("Event not found");
        return true;
    }
}
