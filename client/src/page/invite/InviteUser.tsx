import { Loader } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Logo, { MeridianGraticule } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { BASE_ROUTE } from "@/routes/common/routePaths";
import useAuth from "@/hooks/api/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invitedUserJoinWorkspaceMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const InviteUser = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const param = useParams();
  const inviteCode = param.inviteCode as string;

  const { data: authData, isPending } = useAuth();
  const user = authData?.user;

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: invitedUserJoinWorkspaceMutationFn,
  });

  const returnUrl = encodeURIComponent(
    `${BASE_ROUTE.INVITE_URL.replace(":inviteCode", inviteCode)}`
  );

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    mutate(inviteCode, {
      onSuccess: (data) => {
        queryClient.resetQueries({
          queryKey: ["userWorkspaces"],
        });
        navigate(`/workspace/${data.workspaceId}`);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-background p-6 md:p-10">
      <MeridianGraticule className="pointer-events-none absolute -bottom-52 left-1/2 size-[46rem] -translate-x-1/2 text-foreground opacity-[0.06]" />
      <div className="relative flex w-full max-w-md flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium tracking-tight"
        >
          <Logo />
          Meridian
        </Link>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Invitation
              </p>
              <CardTitle className="text-balance text-xl font-semibold tracking-tight">
                You&apos;ve been invited to a workspace
              </CardTitle>
              <CardDescription className="text-pretty leading-relaxed">
                Sign in or create an account to accept and join your team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPending ? (
                <Loader className="!w-11 !h-11 animate-spin place-self-center flex" />
              ) : (
                <div>
                  {user ? (
                    <div className="my-1 flex items-center justify-center">
                      <form onSubmit={handleSubmit} className="w-full">
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="h-11 w-full text-[15px] font-medium"
                        >
                          {isLoading && (
                            <Loader className="!w-6 !h-6 animate-spin" />
                          )}
                          Join the Workspace
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row items-center gap-2">
                      <Link
                        className="flex-1 w-full text-base"
                        to={`/sign-up?returnUrl=${returnUrl}`}
                      >
                        <Button className="h-11 w-full font-medium">
                          Create account
                        </Button>
                      </Link>
                      <Link
                        className="flex-1 w-full text-base"
                        to={`/?returnUrl=${returnUrl}`}
                      >
                        <Button
                          variant="outline"
                          className="h-11 w-full font-medium"
                        >
                          Sign in
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InviteUser;
