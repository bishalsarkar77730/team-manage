---
tags: [gotcha, backend, data, mongodb]
---

# Array Queries Match Element-wise

## Symptom

Running `npm run migrate:assignees` a second time turned `assignedTo: [u1, u2]`
into a nested `[ [u1, u2] ]`. The migration described itself as idempotent.
It was not.

## Cause

A MongoDB **query predicate on an array field is applied to each element**, not
to the field as a whole. That is the same behaviour that makes
`{ assignedTo: userId }` usefully match a task where `userId` is one of several
assignees — and it is exactly what breaks here.

So this selector:

```ts
{ assignedTo: { $type: "objectId" } }
```

matches a document holding `[u1, u2]`, because *the elements* are ObjectIds. The
pipeline then wraps the whole array again:

```ts
[{ $set: { assignedTo: ["$assignedTo"] } }]   //  [u1,u2]  →  [[u1,u2]]
```

## Fix

Select with an **aggregation expression**. Aggregation expressions see the field
as one value and do no element-wise traversal:

```ts
const NOT_AN_ARRAY = { $expr: { $ne: [{ $isArray: "$assignedTo" }, true] } };
```

And do the whole conversion in one idempotent pass:

```ts
collection.updateMany(NOT_AN_ARRAY, [{
  $set: { assignedTo: {
    $cond: [{ $in: [{ $type: "$assignedTo" }, ["missing", "null"]] },
            [], ["$assignedTo"]],
  }},
}]);
```

## The reason it was nearly missed

The idempotence assertion **passed on corrupted data**:

```ts
String(sc[0]) === String(u1)     // sc = [[u1]] → "6a97…" === "6a97…" → true
```

Array-to-string coercion strips the brackets, so a nested array stringifies
identically to a flat one. The assertion could not see the bug it existed to
catch. The fixed version checks each element's type:

```ts
v.every((x) => x instanceof mongoose.Types.ObjectId)
```

plus a collection-wide nested-array count as a backstop.

## Generalise

- A query predicate on an array field ⇒ element-wise. `$expr` ⇒ whole value.
- `$type: "array"` in a query is *also* unreliable here for the same reason —
  prefer `$isArray` inside `$expr`.
- Never assert on stringified values when the shape is what you are testing.

## Related

- [[Seeders and Migrations]] · [[Tasks]] · [[Data Model]] · [[Verification Harness]]
