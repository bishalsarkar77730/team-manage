---
tags: [gotcha, backend, data, security]
---

# Role Seeding Must Preserve `_id`

## Symptom

*Would have been:* after running `npm run seed`, every user — owners included —
has no permissions in any workspace. The UI hides everything, every mutating
call 403s, and the roles collection looks perfectly correct.

Caught before it ever ran against real data.

## Cause

The original seeder:

```ts
await RoleModel.deleteMany({}, { session });

for (const roleName in RolePermissions) {
  const existingRole = await RoleModel.findOne({ name: role }).session(session);
  if (!existingRole) {
    await new RoleModel({ name: role, permissions }).save({ session });
  }
}
```

Two problems, and the second hides the first:

1. `Member.role` is an **ObjectId reference**. Deleting the roles and inserting
   replacements gives them **new `_id`s**, so every existing membership points
   at a document that no longer exists. `populate("role")` returns null,
   `usePermissions` gets nothing, everyone is locked out.
2. The `findOne` guard on line 24 reads as a safety check but can never fire —
   the `deleteMany` ran first, inside the same transaction, so nothing is ever
   found and every role is always recreated.

## Fix

Update in place, matched by `name`, never delete:

```ts
const existing = await RoleModel.findOne({ name: role }).session(session);
if (!existing) { /* create */ }
else { existing.permissions = permissions; await existing.save({ session }); }
```

It now also logs the diff, which makes a bad run obvious immediately:

```
Role MEMBER updated (_id kept 6a968fe6f8abebe39cb4919c). +EDIT_OWN_TASK -EDIT_TASK
```

## Verified

In a throwaway database: create a role, attach a member to it, mutate the
permissions to simulate the old state, re-seed, then assert the role's `_id` is
unchanged **and** that the member still resolves to a live role.

There was also a self-inflicted bug in the rewrite — `mongoose.startSession()`
was called before `connectDatabase()`, which fails with
`Connection operation buffering timed out after 10000ms`. The test caught it.

## Generalise

> [!important] Never delete-and-recreate a document that other documents reference by `_id`
> Seeders and migrations should be **upserts matched on a natural key**. Ask
> "what points at this?" before any `deleteMany`.

## Related

- [[Seeders and Migrations]] · [[Permissions and Roles]] · [[Data Model]]
