import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/database.config";
import TaskModel from "../models/task.model";

/**
 * One-off migration: `assignedTo` used to hold a single ObjectId (or null) and
 * now holds an array.
 *
 * MongoDB matches `{ assignedTo: X }` against both a scalar X and an array
 * containing X, so reads keep working before this runs — but writes and the
 * populate of a scalar into an array field do not, so existing documents need
 * converting once.
 *
 * Safe to run more than once. That safety is the whole reason this selects on
 * `$expr` + `$isArray` rather than on `{ assignedTo: { $type: "objectId" } }`:
 * a plain query predicate is applied to each ELEMENT of an array field, so an
 * already-migrated [a, b] matches "is an objectId" and gets wrapped a second
 * time into [[a, b]]. An aggregation expression sees the field as one value.
 *
 *   npm run migrate:assignees
 */

// everything that is not already an array: a bare ObjectId, an explicit null,
// or no field at all
const NOT_AN_ARRAY = { $expr: { $ne: [{ $isArray: "$assignedTo" }, true] } };

const migrate = async () => {
  await connectDatabase();

  const collection = mongoose.connection.db!.collection(
    TaskModel.collection.name
  );

  const total = await collection.countDocuments({});
  const already = await collection.countDocuments({
    $expr: { $eq: [{ $isArray: "$assignedTo" }, true] },
  });
  const pending = await collection.countDocuments(NOT_AN_ARRAY);

  console.log(`tasks total            : ${total}`);
  console.log(`already an array       : ${already}`);
  console.log(`to convert             : ${pending}`);

  if (pending === 0) {
    console.log("\nnothing to migrate.");
    await mongoose.disconnect();
    return;
  }

  // one pass: a missing field or null becomes [], anything else is wrapped
  const result = await collection.updateMany(NOT_AN_ARRAY, [
    {
      $set: {
        assignedTo: {
          $cond: [
            { $in: [{ $type: "$assignedTo" }, ["missing", "null"]] },
            [],
            ["$assignedTo"],
          ],
        },
      },
    },
  ]);

  console.log(`\nconverted              : ${result.modifiedCount}`);

  const remaining = await collection.countDocuments(NOT_AN_ARRAY);
  const nested = await collection.countDocuments({
    $expr: {
      $gt: [
        {
          $size: {
            $filter: {
              input: { $ifNull: ["$assignedTo", []] },
              as: "a",
              cond: { $eq: [{ $type: "$$a" }, "array"] },
            },
          },
        },
        0,
      ],
    },
  });

  if (remaining === 0 && nested === 0) {
    console.log("\nall tasks now hold a flat array of ids.");
  } else {
    if (remaining) console.log(`\nWARNING: ${remaining} task(s) still not an array.`);
    if (nested) console.log(`WARNING: ${nested} task(s) hold a nested array.`);
  }

  await mongoose.disconnect();
};

migrate().catch(async (error) => {
  console.error("Migration failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
