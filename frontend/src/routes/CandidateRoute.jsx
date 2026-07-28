import { Navigate, useLocation } from "react-router-dom";

const CandidateRoute = ({ children }) => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    const location = useLocation();

    if (!token) {
        return <Navigate to="/unauthorized?type=candidate" replace />;
    }

    // Allow recruiters to access the Find Jobs page (dashboard)
    if (role === "RECRUITER" && location.pathname === "/dashboard") {
        return children;
    }

    if (role !== "CANDIDATE") {
        return <Navigate to="/unauthorized?type=candidate" replace />;
    }

    return children;
};

export default CandidateRoute;