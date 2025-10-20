import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
