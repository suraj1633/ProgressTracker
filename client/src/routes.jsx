import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import Tips from "./pages/Tips";
import TopicPage from "./pages/TopicPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import MateProfile from "./pages/MateProfile";
import MateChat from "./pages/MateChat";
import ProtectedRoute from "./components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          element={<ProtectedRoute />}
        >
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/tips"
            element={<Tips />}
          />

          <Route
            path="/friends"
            element={<Friends />}
          />

          <Route
            path="/friends/:id"
            element={<MateProfile />}
          />

          <Route
            path="/friends/:id/chat"
            element={<MateChat />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/topic/:id"
            element={<TopicPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
