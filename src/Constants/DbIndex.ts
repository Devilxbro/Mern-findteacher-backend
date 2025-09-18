/**
 * Db/index.ts
 * -----------------------------------------------------
 * Central entry point for all MongoDB models/entities.
 * Any new entity/model you create should be imported here.
 *
 * Usage:
 *    import { models } from '../Db';
 *    const user = await models.User.findOne({ ... });
 */

import { connectDB, disconnectDB } from "../Db/connection.ts"; // Your existing connect/disconnect
import { UserModel } from "../Db/entities/User.ts";
// import { TeacherModel } from "./entities/Teacher"; // example
// import { BusinessModel } from "./entities/Business"; // example
// import { EventModel } from "./entities/Event"; // example

// Export all models for easy access
export const models = {
    User: UserModel,
    // Teacher: TeacherModel,
    // Business: BusinessModel,
    // Event: EventModel,
    // Add new models here
};

// Re-export connection functions
export { connectDB, disconnectDB };
