import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import RouteLoader from "./RouteLoader/RouteLoader";

const ProtectedRoute = () => {
  const { user, loading } =
    useAuth();

  if (loading) {
    return <RouteLoader />;
  }

  if (!user) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
