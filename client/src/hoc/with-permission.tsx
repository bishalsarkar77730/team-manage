/* eslint-disable @typescript-eslint/no-explicit-any */
import { PermissionType } from "@/constant";
import { useAuthContext } from "@/context/auth-provider";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";

const withPermission = (
  WrappedComponent: React.ComponentType,
  requiredPermission: PermissionType
) => {
  const WithPermission = (props: any) => {
    const { user, workspace, hasPermission, isLoading, workspaceLoading } =
      useAuthContext();
    const navigate = useNavigate();
    const workspaceId = useWorkspaceId();

    // Permissions are derived from the workspace membership, not from the
    // user, so a decision made before the workspace query settles always says
    // "denied" and bounces someone who is in fact allowed in.
    const settled = !isLoading && !workspaceLoading && !!user && !!workspace;
    const allowed = settled && hasPermission(requiredPermission);

    useEffect(() => {
      if (settled && !allowed) {
        navigate(`/workspace/${workspaceId}`, { replace: true });
      }
    }, [settled, allowed, navigate, workspaceId]);

    if (!settled) {
      return (
        <div className="flex h-[50vh] w-full items-center justify-center">
          <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (!allowed) return null;

    return <WrappedComponent {...props} />;
  };
  return WithPermission;
};

export default withPermission;
