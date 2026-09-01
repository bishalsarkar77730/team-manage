---
tags: [ops, data]
---

# Seeders and Migrations

Two scripts. **Both were dangerous as originally written**, and both were
rewritten before they were ever run against real data. Read the two gotcha notes
before touching either.

## `npm run seed` — roles

`backend/src/seeders/role.seeder.ts`. Brings the `roles` collection in line with
`utils/role-permission.ts`.

Idempotent. Updates in place, matched by `name`, in a transaction. Logs exactly
which permissions moved:

```
Role OWNER updated (_id kept 6a968fe5f8abebe39cb49196). +EDIT_OWN_TASK, +VIEW_ALL_TASKS
Role ADMIN updated (_id kept 6a968fe5f8abebe39cb49199). +EDIT_OWN_TASK, +VIEW_ALL_TASKS
Role MEMBER updated (_id kept 6a968fe6f8abebe39cb4919c). +EDIT_OWN_TASK -EDIT_TASK
```

> [!danger] It used to `deleteMany({})` first
> `Member.role` is an ObjectId reference. Deleting and recreating roles gives
> them new `_id`s, orphaning every membership and leaving every user with zero
> permissions. Full write-up: [[Role Seeding Must Preserve _id]].

Run it after **any** edit to `role-permission.ts` — the file alone changes
nothing. See [[Permissions and Roles]].

## `npm run migrate:assignees` — scalar → array

`backend/src/seeders/task-assignees.seeder.ts`. Converts the old scalar
`Task.assignedTo` to an array. One pass, idempotent:

```ts
const NOT_AN_ARRAY = { $expr: { $ne: [{ $isArray: "$assignedTo" }, true] } };

collection.updateMany(NOT_AN_ARRAY, [{
  $set: { assignedTo: {
    $cond: [{ $in: [{ $type: "$assignedTo" }, ["missing", "null"]] },
            [], ["$assignedTo"]],
  }},
}]);
```

Missing or null → `[]`. Anything else → wrapped. Already an array → untouched.
It reports a nested-array count at the end as a self-check.

> [!danger] The obvious selector is wrong
> `{ assignedTo: { $type: "objectId" } }` matches arrays **element-wise**, so
> `[u1, u2]` matches "is an ObjectId" and gets wrapped again into a nested
> `[ [u1, u2] ]`.
> Full write-up: [[Array Queries Match Element-wise]].

## Verifying before running

Both scripts are exercised against a **throwaway database that the test creates
and drops** — never application collections. 17 checks, including a member
surviving a re-seed with its role reference intact, and re-running the migration
over scalar / null / already-array / missing-field documents.

The pattern:

```ts
const DB = "seedcheck_" + Date.now();
// … run the real scripts against it via execFileSync with MONGO_URI overridden
await db.dropDatabase();
```

> [!tip] Assert shapes, not stringified values
> One assertion here gave a **false pass** because `String([u1]) === String(u1)`
> — array-to-string coercion strips the brackets, so it could not tell a flat
> array from a nested one. That false pass hid the double-wrap bug. Check
> `x instanceof mongoose.Types.ObjectId` per element.

## Related

- [[Permissions and Roles]] · [[Data Model]] · [[Tasks]] · [[Verification Harness]]
