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
import { BookingModel } from "../Db/entities/Bookings.ts";
import { PaymentModel } from "../Db/entities/Payments.ts";
import { SlotModel } from "../Db/entities/Slots";

export const models = {
  User: UserModel,
  Slot: SlotModel,
  Booking: BookingModel,
  Payment: PaymentModel
};


// // Export all models for easy access
// export const models = {
//     User: UserModel,
//     // Chats: TeacherModel,
//     // Business: BusinessModel,
//     // Event: EventModel,
//     // Add new models here
// };



export { connectDB, disconnectDB };
