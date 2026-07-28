import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");

    if (!token) {
        return <Navigate to="/unauthorized?type=admin" replace />;
    }

    if (role !== "ADMIN") {
        return <Navigate to="/unauthorized?type=admin" replace />;
    }

    return children;
};

export default AdminRoute;
