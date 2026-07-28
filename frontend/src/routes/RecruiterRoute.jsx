import { Navigate } from "react-router-dom";

const RecruiterRoute = ({ children }) => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");

    if (!token) {
        return <Navigate to="/unauthorized?type=recruiter" replace />;
    }

    if (role !== "RECRUITER") {
        return <Navigate to="/unauthorized?type=recruiter" replace />;
    }

    return children;
};

export default RecruiterRoute;