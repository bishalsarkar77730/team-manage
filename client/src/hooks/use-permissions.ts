import { PermissionType } from "@/constant";
import { UserType, WorkspaceWithMembersType } from "@/types/api.type";
import { useMemo } from "react";

const usePermissions = (
  user: UserType | undefined,
  workspace: WorkspaceWithMembersType | undefined
) => {
  // permissions are fully derived from the user + workspace, so they are
  // computed during render instead of being mirrored into state by an effect.
  // That also means a workspace the user is not a member of yields no
  // permissions, rather than leaving the previous workspace's ones in place.
  return useMemo<PermissionType[]>(() => {
    if (!user || !workspace) return [];

    const member = workspace.members.find(
      (member) => member.userId === user._id
    );

    return member?.role.permissions || [];
  }, [user, workspace]);
};

export default usePermissions;
