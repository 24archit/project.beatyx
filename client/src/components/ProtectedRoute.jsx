import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ isAuth, isLoading }) => {
  if (isLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
      >
        Loading...
      </div>
    ); // Or a better spinner
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
