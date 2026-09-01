import mongoose from "mongoose";
import {
  TaskPriorityEnum,
  TaskSizeEnum,
  TaskStatusEnum,
} from "../enums/task.enum";
import MemberModel from "../models/member.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import { BadRequestException, NotFoundException } from "../utils/appError";

/** Accepts a single id, a list, or nothing, and always returns a list. */
const toIdList = (value: string | string[] | null | undefined): string[] => {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).filter(Boolean);
};

/**
 * Every assignee must actually be in the workspace. Without this check the
 * assignedTo array doubles as a way to expose a task to an arbitrary user id,
 * since assignees are exactly who can see and edit it.
 */
const resolveAssignees = async (
  workspaceId: string,
  assignedTo: string | string[] | null | undefined
) => {
  const ids = toIdList(assignedTo);
  if (!ids.length) return [];

  const members = await MemberModel.find(
    { workspaceId, userId: { $in: ids } },
    { userId: 1 }
  ).lean();

  const allowed = new Set(members.map((m) => String(m.userId)));
  const missing = ids.filter((id) => !allowed.has(String(id)));

  if (missing.length) {
    throw new BadRequestException(
      "One or more assignees are not members of this workspace."
    );
  }

  return ids.map((id) => new mongoose.Types.ObjectId(id));
};

/** A task is "yours" if you created it or you are one of its assignees. */
export const ownTaskFilter = (userId: string) => {
  const id = new mongoose.Types.ObjectId(userId);
  return { $or: [{ createdBy: id }, { assignedTo: id }] };
};

export const createTaskService = async (
  workspaceId: string,
  projectId: string,
  userId: string,
  body: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    size?: string;
    assignedTo?: string | string[] | null;
    dueDate?: string;
  }
) => {
  const { title, description, priority, status, size, assignedTo, dueDate } =
    body;

  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }
  const assignees = await resolveAssignees(workspaceId, assignedTo);

  const task = new TaskModel({
    title,
    description,
    priority: priority || TaskPriorityEnum.MEDIUM,
    status: status || TaskStatusEnum.TODO,
    size: size || TaskSizeEnum.MEDIUM,
    assignedTo: assignees,
    createdBy: userId,
    workspace: workspaceId,
    project: projectId,
    dueDate,
  });

  await task.save();

  return { task };
};

export const updateTaskService = async (
  workspaceId: string,
  projectId: string,
  taskId: string,
  body: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    size?: string;
    assignedTo?: string | string[] | null;
    dueDate?: string;
  },
  /** when set, the caller may only edit tasks they created or are assigned */
  restrictToOwn?: { userId: string }
) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  const task = await TaskModel.findById(taskId);

  if (!task || task.project.toString() !== projectId.toString()) {
    throw new NotFoundException(
      "Task not found or does not belong to this project"
    );
  }

  if (restrictToOwn) {
    const me = String(restrictToOwn.userId);
    const isOwn =
      String(task.createdBy) === me ||
      (task.assignedTo || []).some((id) => String(id) === me);

    if (!isOwn) {
      throw new BadRequestException(
        "You can only edit tasks you created or are assigned to."
      );
    }
  }

  const assignees = await resolveAssignees(workspaceId, body.assignedTo);

  const updatedTask = await TaskModel.findByIdAndUpdate(
    taskId,
    {
      ...body,
      assignedTo: assignees,
    },
    { new: true }
  );

  if (!updatedTask) {
    throw new BadRequestException("Failed to update task");
  }

  return { updatedTask };
};

export const getAllTasksService = async (
  workspaceId: string,
  filters: {
    projectId?: string;
    status?: string[];
    priority?: string[];
    size?: string[];
    assignedTo?: string[];
    keyword?: string;
    dueDate?: string;
    /** My Tasks: restrict to tasks this user created or is assigned to */
    onlyForUserId?: string;
  },
  pagination: {
    pageSize: number;
    pageNumber: number;
  }
) => {
  const query: Record<string, any> = {
    workspace: workspaceId,
  };

  if (filters.projectId) {
    query.project = filters.projectId;
  }

  if (filters.status && filters.status?.length > 0) {
    query.status = { $in: filters.status };
  }

  if (filters.priority && filters.priority?.length > 0) {
    query.priority = { $in: filters.priority };
  }

  if (filters.size && filters.size?.length > 0) {
    query.size = { $in: filters.size };
  }

  // assignedTo is an array on the document, so $in still matches "any of"
  if (filters.assignedTo && filters.assignedTo?.length > 0) {
    query.assignedTo = { $in: filters.assignedTo };
  }

  if (filters.onlyForUserId) {
    // combined with $and so it cannot be widened by another $or above
    query.$and = [...(query.$and || []), ownTaskFilter(filters.onlyForUserId)];
  }

  if (filters.keyword && filters.keyword !== undefined) {
    query.title = { $regex: filters.keyword, $options: "i" };
  }

  if (filters.dueDate) {
    query.dueDate = {
      $eq: new Date(filters.dueDate),
    };
  }

  //Pagination Setup
  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [tasks, totalCount] = await Promise.all([
    TaskModel.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .populate("assignedTo", "_id name profilePicture -password")
      .populate("project", "_id emoji name"),
    TaskModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    tasks,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};

export const getTaskByIdService = async (
  workspaceId: string,
  projectId: string,
  taskId: string
) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  const task = await TaskModel.findOne({
    _id: taskId,
    workspace: workspaceId,
    project: projectId,
  }).populate("assignedTo", "_id name profilePicture -password");

  if (!task) {
    throw new NotFoundException("Task not found.");
  }

  return task;
};

export const deleteTaskService = async (
  workspaceId: string,
  taskId: string
) => {
  const task = await TaskModel.findOneAndDelete({
    _id: taskId,
    workspace: workspaceId,
  });

  if (!task) {
    throw new NotFoundException(
      "Task not found or does not belong to the specified workspace"
    );
  }

  return;
};

/**
 * Everything My Dashboard needs, in one round trip: the headline counts plus
 * the status and priority breakdowns. Aggregated in the database rather than by
 * fetching every task and counting in the browser, which would not survive a
 * real backlog.
 */
export const getMyTaskAnalyticsService = async (
  workspaceId: string,
  userId: string
) => {
  const scope = {
    workspace: new mongoose.Types.ObjectId(workspaceId),
    ...ownTaskFilter(userId),
  };

  const [byStatus, byPriority, overdueTasks] = await Promise.all([
    TaskModel.aggregate([
      { $match: scope },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    TaskModel.aggregate([
      { $match: scope },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]),
    TaskModel.countDocuments({
      ...scope,
      dueDate: { $lt: new Date() },
      status: { $ne: TaskStatusEnum.DONE },
    }),
  ]);

  const toMap = (rows: { _id: string; count: number }[]) =>
    rows.reduce<Record<string, number>>((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {});

  const statusCounts = toMap(byStatus);
  const priorityCounts = toMap(byPriority);
  const totalTasks = byStatus.reduce((sum, row) => sum + row.count, 0);

  return {
    analytics: {
      totalTasks,
      overdueTasks,
      inReviewTasks: statusCounts[TaskStatusEnum.IN_REVIEW] || 0,
      completedTasks: statusCounts[TaskStatusEnum.DONE] || 0,
      // every bucket present, so a zero renders as a zero rather than vanishing
      byStatus: Object.values(TaskStatusEnum).map((value) => ({
        key: value,
        count: statusCounts[value] || 0,
      })),
      byPriority: Object.values(TaskPriorityEnum).map((value) => ({
        key: value,
        count: priorityCounts[value] || 0,
      })),
    },
  };
};
