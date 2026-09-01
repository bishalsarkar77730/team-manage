import { TaskPriorityEnum, TaskSizeEnum, TaskStatusEnum } from "@/constant";
import { transformOptions } from "@/lib/helper";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Circle,
  HelpCircle,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Timer,
  View,
} from "lucide-react";

const statusIcons = {
  [TaskStatusEnum.BACKLOG]: HelpCircle,
  [TaskStatusEnum.TODO]: Circle,
  [TaskStatusEnum.IN_PROGRESS]: Timer,
  [TaskStatusEnum.IN_REVIEW]: View,
  [TaskStatusEnum.DONE]: CheckCircle,
};

const priorityIcons = {
  [TaskPriorityEnum.LOW]: ArrowDown,
  [TaskPriorityEnum.MEDIUM]: ArrowRight,
  [TaskPriorityEnum.HIGH]: ArrowUp,
};

// Ascending signal bars rather than arrows, so size stays visually distinct
// from priority in the same row.
const sizeIcons = {
  [TaskSizeEnum.SMALL]: SignalLow,
  [TaskSizeEnum.MEDIUM]: SignalMedium,
  [TaskSizeEnum.LARGE]: SignalHigh,
};

export const statuses = transformOptions(
  Object.values(TaskStatusEnum),
  statusIcons
);

export const priorities = transformOptions(
  Object.values(TaskPriorityEnum),
  priorityIcons
);

export const sizes = transformOptions(Object.values(TaskSizeEnum), sizeIcons);
