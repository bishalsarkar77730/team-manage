import { randomUUID } from "crypto";

export function generateInviteCode() {
  return randomUUID().replace(/-/g, "").substring(0, 8);
}

export function generateTaskCode() {
  return `task-${randomUUID().replace(/-/g, "").substring(0, 3)}`;
}
