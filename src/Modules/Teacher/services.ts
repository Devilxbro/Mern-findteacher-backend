import { UserModel } from "../../Db/entities/User.ts";
import { ReviewModel } from "../../Db/entities/Review.ts";
import { Types } from "mongoose";
import debug from "debug";

const log = debug("app:teacher-service");

export class TeacherService {
    private static instance: TeacherService;
    private constructor() {}
    public static getInstance() {
        if (!TeacherService.instance) TeacherService.instance = new TeacherService();
        return TeacherService.instance;
    }

  async listTeachers(filter: any = {}) {
    log("listTeachers filter:", filter);

    const page = parseInt(filter.page || "1", 10);
    const limit = parseInt(filter.limit || "10", 10);
    const skip = (page - 1) * limit;

    const match: any = { role: "teacher", isActive: true };

    // Featured filter
    if (filter.isFeatured) match.isFeatured = true;

    // Top-rated filter
    if (filter.minRating) match.rating = { $gte: Number(filter.minRating) };

    // Affordable filter
    if (filter.maxHourlyRate) match.hourlyRate = { $lte: Number(filter.maxHourlyRate) };

    const pipeline: any[] = [];

    // --- Nearby filter ---
    if (filter.latitude && filter.longitude) {
      pipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [Number(filter.longitude), Number(filter.latitude)] },
          distanceField: "distance",
          spherical: true,
          maxDistance: Number(filter.maxDistance || 10000), // meters
          query: match, // apply other filters here
        },
      });
    } else {
      // No nearby: apply match stage
      pipeline.push({ $match: match });
    }

    // Sorting
    const sort: any = {};
    if (filter.sortBy === "rating") sort.rating = -1;
    else if (filter.sortBy === "hourlyRate") sort.hourlyRate = 1;
    else if (!filter.latitude) sort.createdAt = -1; // only if not geoNear
    // if geoNear is used, distance is already sorted by default

    if (Object.keys(sort).length) pipeline.push({ $sort: sort });

    // Pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    log("Aggregation pipeline:", JSON.stringify(pipeline, null, 2));

    const teachers = await UserModel.aggregate(pipeline);

    // Count total (without skip/limit)
    const total = await UserModel.countDocuments(match);
    const totalPages = Math.ceil(total / limit);
    const nextPage = page < totalPages ? page + 1 : null;

    return { teachers, total, page, totalPages, nextPage };
  }


  async getTeacherById(id: string) {
        const teacher = await UserModel.findById(id).select("-password").lean();
        if (!teacher) throw new Error("Teacher not found");
        return teacher;
    }

    async addReview(teacherId: string, studentId: string, rating: number, feedback?: string) {
        const review = await ReviewModel.create({ teacherId, studentId, rating, feedback });

        // Recalculate average rating for teacher
        const stats = await ReviewModel.aggregate([
            { $match: { teacherId: new Types.ObjectId(teacherId) } },
            { $group: { _id: "$teacherId", avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
        ]);

        if (stats.length > 0) {
            await UserModel.findByIdAndUpdate(teacherId, {
                rating: stats[0].avgRating,
                totalReviews: stats[0].totalReviews,
            });
        }

        return review;
    }


    async getReviews(teacherId: string) {
        return ReviewModel.find({ teacherId })
            .populate("studentId", "fullName email")
            .sort({ createdAt: -1 });
    }
}
