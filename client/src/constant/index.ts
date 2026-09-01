export const TaskStatusEnum = {
  BACKLOG: "BACKLOG",
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  DONE: "DONE",
} as const;

export const TaskPriorityEnum = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;

export const TaskSizeEnum = {
  SMALL: "SMALL",
  MEDIUM: "MEDIUM",
  LARGE: "LARGE",
} as const;

export type TaskStatusEnumType = keyof typeof TaskStatusEnum;
export type TaskPriorityEnumType = keyof typeof TaskPriorityEnum;
export type TaskSizeEnumType = keyof typeof TaskSizeEnum;

export const Permissions = {
  CREATE_WORKSPACE: "CREATE_WORKSPACE",
  DELETE_WORKSPACE: "DELETE_WORKSPACE",
  EDIT_WORKSPACE: "EDIT_WORKSPACE",
  MANAGE_WORKSPACE_SETTINGS: "MANAGE_WORKSPACE_SETTINGS",
  ADD_MEMBER: "ADD_MEMBER",
  CHANGE_MEMBER_ROLE: "CHANGE_MEMBER_ROLE",
  REMOVE_MEMBER: "REMOVE_MEMBER",
  CREATE_PROJECT: "CREATE_PROJECT",
  EDIT_PROJECT: "EDIT_PROJECT",
  DELETE_PROJECT: "DELETE_PROJECT",
  CREATE_TASK: "CREATE_TASK",
  /** edit any task in the workspace */
  EDIT_TASK: "EDIT_TASK",
  DELETE_TASK: "DELETE_TASK",
  /** see every task, not just your own */
  VIEW_ALL_TASKS: "VIEW_ALL_TASKS",
  /** edit a task you created or are assigned to */
  EDIT_OWN_TASK: "EDIT_OWN_TASK",
  VIEW_ONLY: "VIEW_ONLY",
} as const;

export type PermissionType = keyof typeof Permissions;
