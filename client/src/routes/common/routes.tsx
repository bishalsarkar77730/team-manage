// --- Google OAuth (disabled) ---
// import GoogleOAuthFailure from "@/page/auth/GoogleOAuthFailure";
import SignIn from "@/page/auth/Sign-in";
import SignUp from "@/page/auth/Sign-up";
import WorkspaceDashboard from "@/page/workspace/Dashboard";
import Members from "@/page/workspace/Members";
import ProjectDetails from "@/page/workspace/ProjectDetails";
import Settings from "@/page/workspace/Settings";
import Tasks from "@/page/workspace/Tasks";
import Meetings from "@/page/workspace/Meetings";
import MyDashboard from "@/page/workspace/MyDashboard";
import MyTasks from "@/page/workspace/MyTasks";
import Notes from "@/page/workspace/Notes";
import { AUTH_ROUTES, BASE_ROUTE, PROTECTED_ROUTES } from "./routePaths";
import InviteUser from "@/page/invite/InviteUser";

export const authenticationRoutePaths = [
  { path: AUTH_ROUTES.SIGN_IN, element: <SignIn /> },
  { path: AUTH_ROUTES.SIGN_UP, element: <SignUp /> },
  // --- Google OAuth (disabled) ---
  // { path: AUTH_ROUTES.GOOGLE_OAUTH_CALLBACK, element: <GoogleOAuthFailure /> },
];

export const protectedRoutePaths = [
  { path: PROTECTED_ROUTES.WORKSPACE, element: <WorkspaceDashboard /> },
  { path: PROTECTED_ROUTES.TASKS, element: <Tasks /> },
  { path: PROTECTED_ROUTES.MEMBERS, element: <Members /> },
  { path: PROTECTED_ROUTES.SETTINGS, element: <Settings /> },
  { path: PROTECTED_ROUTES.PROJECT_DETAILS, element: <ProjectDetails /> },
  { path: PROTECTED_ROUTES.MY_DASHBOARD, element: <MyDashboard /> },
  { path: PROTECTED_ROUTES.MY_TASKS, element: <MyTasks /> },
  { path: PROTECTED_ROUTES.MY_MEETINGS, element: <Meetings /> },
  { path: PROTECTED_ROUTES.MY_NOTES, element: <Notes /> },
];

export const baseRoutePaths = [
  { path: BASE_ROUTE.INVITE_URL, element: <InviteUser /> },
];
