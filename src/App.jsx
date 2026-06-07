import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import AuthCallback from "./pages/Auth/AuthCallback";
import Landing from "./pages/Landing/Landing";
import Dashboard from "./pages/Dashboard/Dashboard";
import Study from "./pages/Study/Study";
import Solo from "./pages/Study/Solo";
import PrivateRooms from "./pages/Study/PrivateRooms";
import PrivateRoom from "./pages/Study/PrivateRoom";
import Servers from "./pages/Study/Servers";
import ServerRoom from "./pages/Study/ServerRoom";
import Schools from "./pages/Schools/Schools";
import OrientationTest from "./pages/Orientation/OrientationTest";
import Profile from "./pages/Profile/Profile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/app/dashboard" element={<Dashboard />} />
      <Route path="/app/study" element={<Study />} />
      <Route path="/app/study/solo" element={<Solo />} />
      <Route path="/app/study/rooms" element={<PrivateRooms />} />
      <Route path="/app/study/room/:roomId" element={<PrivateRoom />} />
      <Route path="/app/servers" element={<Servers />} />
      <Route path="/app/servers/public" element={<ServerRoom />} />
      <Route path="/app/servers/:serverId" element={<ServerRoom />} />
      <Route path="/app/orientation" element={<OrientationTest />} />
      <Route path="/app/schools" element={<Schools />} />
      <Route path="/app/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}