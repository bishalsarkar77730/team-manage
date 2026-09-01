import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/database.config";
import RoleModel from "../models/roles-permission.model";
import { RolePermissions } from "../utils/role-permission";

/**
 * Brings the Role collection in line with RolePermissions.
 *
 * Roles are updated in place, matched by name. They are never deleted and
 * recreated: Member.role is an ObjectId reference, so a new _id would orphan
 * every existing membership and leave the whole workspace with no permissions.
 * Re-running this is safe.
 */
const seedRoles = async () => {
  console.log("Seeding roles started...");

  await connectDatabase();

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    for (const roleName in RolePermissions) {
      const role = roleName as keyof typeof RolePermissions;
      const permissions = RolePermissions[role];

      const existing = await RoleModel.findOne({ name: role }).session(session);

      if (!existing) {
        await new RoleModel({ name: role, permissions }).save({ session });
        console.log(`Role ${role} created with ${permissions.length} permissions.`);
        continue;
      }

      const before = [...existing.permissions].sort();
      const after = [...permissions].sort();
      const unchanged =
        before.length === after.length && before.every((p, i) => p === after[i]);

      if (unchanged) {
        console.log(`Role ${role} already up to date.`);
        continue;
      }

      const added = after.filter((p) => !before.includes(p));
      const removed = before.filter((p) => !after.includes(p as never));

      existing.permissions = permissions as typeof existing.permissions;
      await existing.save({ session });

      console.log(
        `Role ${role} updated (_id kept ${existing._id}).` +
          (added.length ? ` +${added.join(", +")}` : "") +
          (removed.length ? ` -${removed.join(", -")}` : "")
      );
    }

    await session.commitTransaction();
    console.log("Transaction committed.");
    console.log("Seeding completed successfully.");
  } catch (error) {
    await session.abortTransaction();
    console.error("Error during seeding, rolled back:", error);
    process.exitCode = 1;
  } finally {
    await session.endSession();
    await mongoose.connection.close();
  }
};

seedRoles().catch((error) => {
  console.error("Error running seed script:", error);
  process.exitCode = 1;
});
