import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SubmitWastePage } from "./pages/SubmitWastePage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ActivityFeedPage } from "./pages/ActivityFeedPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { RewardsPage } from "./pages/RewardsPage";
import { ModeratorPage } from "./pages/ModeratorPage";
import { AdminPage } from "./pages/AdminPage";
import { AuditTrailPage } from "./pages/AuditTrailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/signup",
    Component: SignUpPage,
  },
  {
    path: "/app",
    Component: AppLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "submit", Component: SubmitWastePage },
      { path: "leaderboard", Component: LeaderboardPage },
      { path: "feed", Component: ActivityFeedPage },
      { path: "profile/:username", Component: ProfilePage },
      { path: "profile", Component: ProfilePage },
      { path: "settings", Component: SettingsPage },
      { path: "rewards", Component: RewardsPage },
      { path: "moderator", Component: ModeratorPage },
      { path: "admin", Component: AdminPage },
      { path: "audit", Component: AuditTrailPage },
    ],
  },
]);
