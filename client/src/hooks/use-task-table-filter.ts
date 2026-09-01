import {
  TaskPriorityEnum,
  TaskPriorityEnumType,
  TaskSizeEnum,
  TaskSizeEnumType,
  TaskStatusEnum,
  TaskStatusEnumType,
} from "@/constant";
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

const useTaskTableFilter = () => {
  return useQueryStates({
    status: parseAsStringEnum<TaskStatusEnumType>(
      Object.values(TaskStatusEnum)
    ),
    priority: parseAsStringEnum<TaskPriorityEnumType>(
      Object.values(TaskPriorityEnum)
    ),
    size: parseAsStringEnum<TaskSizeEnumType>(Object.values(TaskSizeEnum)),
    keyword: parseAsString,
    projectId: parseAsString,
    assigneeId: parseAsString,
  });
};

export default useTaskTableFilter;
