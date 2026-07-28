import { Navigate, useLocation } from "react-router-dom";

const PublicRoute = ({ children }) => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    const location = useLocation();

    if (!token) {
        return children;
    }

    // Only redirect recruiters away from their own section's public pages,
    // allowing cross-visibility on candidate public pages
    if (role === "RECRUITER" && location.pathname.startsWith("/hire/")) {
        return (
            <Navigate
                to="/hire/dashboard"
                replace
            />
        );
    }

    return children;
};

export default PublicRoute;