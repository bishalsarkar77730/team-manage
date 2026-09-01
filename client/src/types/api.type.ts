import {
  PermissionType,
  TaskPriorityEnumType,
  TaskSizeEnumType,
  TaskStatusEnumType,
} from "@/constant";

export type loginType = { email: string; password: string };
export type LoginResponseType = {
  message: string;
  user: {
    _id: string;
    currentWorkspace: string;
  };
};

export type registerType = {
  name: string;
  email: string;
  password: string;
};

// USER TYPE
export type UserType = {
  _id: string;
  name: string;
  email: string;
  profilePicture: string | null;
  isActive: true;
  lastLogin: null;
  createdAt: Date;
  updatedAt: Date;
  currentWorkspace: {
    _id: string;
    name: string;
    owner: string;
    inviteCode: string;
  };
};

export type CurrentUserResponseType = {
  message: string;
  user: UserType;
};

//******** */ WORLSPACE TYPES ****************
// ******************************************
export type WorkspaceType = {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  inviteCode: string;
};

export type CreateWorkspaceType = {
  name: string;
  description: string;
};

export type EditWorkspaceType = {
  workspaceId: string;
  data: {
    name: string;
    description: string;
  };
};

export type CreateWorkspaceResponseType = {
  message: string;
  workspace: WorkspaceType;
};

export type AllWorkspaceResponseType = {
  message: string;
  workspaces: WorkspaceType[];
};

export type WorkspaceWithMembersType = WorkspaceType & {
  members: {
    _id: string;
    userId: string;
    workspaceId: string;
    role: {
      _id: string;
      name: string;
      permissions: PermissionType[];
    };
    joinedAt: string;
    createdAt: string;
  }[];
};

export type WorkspaceByIdResponseType = {
  message: string;
  workspace: WorkspaceWithMembersType;
};

export type ChangeWorkspaceMemberRoleType = {
  workspaceId: string;
  data: {
    roleId: string;
    memberId: string;
  };
};

export type AllMembersInWorkspaceResponseType = {
  message: string;
  members: {
    _id: string;
    userId: {
      _id: string;
      name: string;
      email: string;
      profilePicture: string | null;
    };
    workspaceId: string;
    role: {
      _id: string;
      name: string;
    };
    joinedAt: string;
    createdAt: string;
  }[];
  roles: RoleType[];
};

export type AnalyticsResponseType = {
  message: string;
  analytics: {
    totalTasks: number;
    overdueTasks: number;
    /** may be absent on an older server response */
    inReviewTasks?: number;
    completedTasks: number;
  };
};

export type PaginationType = {
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
  skip: number;
  limit: number;
};

export type RoleType = {
  _id: string;
  name: string;
};
// *********** MEMBER ****************

//******** */ PROJECT TYPES ****************
//****************************************** */
export type ProjectType = {
  _id: string;
  name: string;
  emoji: string;
  description: string;
  workspace: string;
  createdBy: {
    _id: string;
    name: string;
    profilePicture: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectPayloadType = {
  workspaceId: string;
  data: {
    emoji: string;
    name: string;
    description: string;
  };
};

export type ProjectResponseType = {
  message: "Project created successfully";
  project: ProjectType;
};

export type EditProjectPayloadType = {
  workspaceId: string;
  projectId: string;
  data: {
    emoji: string;
    name: string;
    description: string;
  };
};

//ALL PROJECTS IN WORKSPACE TYPE
export type AllProjectPayloadType = {
  workspaceId: string;
  pageNumber?: number;
  pageSize?: number;
  keyword?: string;
  skip?: boolean;
};

export type AllProjectResponseType = {
  message: string;
  projects: ProjectType[];
  pagination: PaginationType;
};

// SINGLE PROJECT IN WORKSPACE TYPE
export type ProjectByIdPayloadType = {
  workspaceId: string;
  projectId: string;
};

//********** */ TASK TYPES ************************
//************************************************* */

export type CreateTaskPayloadType = {
  workspaceId: string;
  projectId: string;
  data: {
    title: string;
    description: string;
    priority: TaskPriorityEnumType;
    status: TaskStatusEnumType;
    size: TaskSizeEnumType;
    assignedTo: string[];
    dueDate: string;
  };
};


//added new for edtiting of task
export type EditTaskPayloadType = {
  taskId: string;
  workspaceId: string;
  projectId: string;
  data: Partial<{
    title: string;
    description: string;
    priority: TaskPriorityEnumType;
    status: TaskStatusEnumType;
    size: TaskSizeEnumType;
    assignedTo: string[];
    dueDate: string;
  }>;
};


export type TaskType = {
  _id: string;
  title: string;
  description?: string;
  project?: {
    _id: string;
    emoji: string;
    name: string;
  };
  priority: TaskPriorityEnumType;
  status: TaskStatusEnumType;
  size: TaskSizeEnumType;
  /** a task can belong to several members; all of them can see and edit it */
  assignedTo: {
    _id: string;
    name: string;
    profilePicture: string | null;
  }[];
  createdBy?: string;
  dueDate: string;
  taskCode: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AllTaskPayloadType = {
  workspaceId: string;
  projectId?: string | null;
  keyword?: string | null;
  priority?: TaskPriorityEnumType | null;
  status?: TaskStatusEnumType | null;
  size?: TaskSizeEnumType | null;
  assignedTo?: string | null;
  dueDate?: string | null;
  pageNumber?: number | null;
  pageSize?: number | null;
  /** ask the server for only the caller's own tasks */
  mine?: boolean;
};

export type MyTaskAnalyticsResponseType = {
  message: string;
  analytics: {
    totalTasks: number;
    overdueTasks: number;
    inReviewTasks: number;
    completedTasks: number;
    byStatus: { key: TaskStatusEnumType; count: number }[];
    byPriority: { key: TaskPriorityEnumType; count: number }[];
  };
};

//********** */ NOTE + MEETING TYPES ****************
//************************************************* */

export type VisibilityType = "PRIVATE" | "SHARED";

export type MiniUserType = {
  _id: string;
  name: string;
  profilePicture: string | null;
};

export type NoteType = {
  _id: string;
  userId: MiniUserType;
  workspaceId: string;
  title: string;
  /** sanitised HTML from the editor */
  content: string;
  visibility: VisibilityType;
  sharedWith: MiniUserType[];
  createdAt: string;
  updatedAt: string;
};

export type AllNotesResponseType = {
  message: string;
  notes: NoteType[];
  pagination: PaginationType;
};

export type NotePayloadType = {
  title: string;
  content: string;
  visibility: VisibilityType;
  sharedWith: string[];
};

export type MeetingType = {
  _id: string;
  userId: MiniUserType;
  workspaceId: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  meetingLink: string | null;
  location: string | null;
  visibility: VisibilityType;
  sharedWith: MiniUserType[];
  createdAt: string;
  updatedAt: string;
};

export type AllMeetingsResponseType = {
  message: string;
  meetings: MeetingType[];
  pagination: PaginationType;
};

export type MeetingPayloadType = {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  meetingLink: string;
  location: string;
  visibility: VisibilityType;
  sharedWith: string[];
};

//********** */ PRESENCE TYPES ***********************
//************************************************* */

export type MemberPresenceType = {
  userId: string;
  /** derived server-side from how stale lastSeenAt is — never stored */
  online: boolean;
  lastSeenAt: string | null;
  sessionStartedAt: string | null;
  activeMsToday: number;
};

export type WorkspacePresenceResponseType = {
  message: string;
  presence: MemberPresenceType[];
  onlineWindowMs: number;
};

export type AllTaskResponseType = {
  message: string;
  tasks: TaskType[];
  pagination: PaginationType;
};
