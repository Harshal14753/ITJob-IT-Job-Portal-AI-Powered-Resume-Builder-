import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthRedirect = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const role = localStorage.getItem("role");

        // Not logged in — no redirect needed
        if (!token || !role) {
            return;
        }

        const currentPath = location.pathname;

        // Pages accessible by anyone regardless of login state
        const publicPaths = [
            "/login",
            "/hire/login",
            "/admin/login",
            "/profile-setup",
            "/profile-setup-choice",
            "/ai-profile-setup",
            "/hire/profile-setup",
            "/unauthorized",
            "/company-reviews",
            "/salary-guide",
            "/contact",
            "/admin",
            "/admin/dashboard",
            "/admin/users",
            "/admin/jobs",
            "/admin/categories",
            "/admin/contacts",
            "/admin/config",
        ];
        if (publicPaths.includes(currentPath)) {
            return;
        }

        // Already on the correct dashboard — no redirect
        if (
            (role === "CANDIDATE" && currentPath === "/dashboard") ||
            (role === "RECRUITER" && currentPath === "/hire/dashboard") ||
            (role === "ADMIN" && currentPath.startsWith("/admin"))
        ) {
            return;
        }

        // Admin pages
        if (role === "ADMIN") {
            return;
        }

        // Cross-visibility: recruiter public pages that candidates can browse
        const candidateAccessiblePaths = [
            "/hire",
            "/hire/",
            "/hire/find-cvs",
            "/hire/products",
            "/hire/pricing",
        ];
        if (role === "CANDIDATE" && candidateAccessiblePaths.includes(currentPath)) {
            return;
        }

        // Cross-visibility: candidate public pages that recruiters can browse
        const recruiterAccessiblePaths = [
            "/",
            "/dashboard",
        ];
        if (role === "RECRUITER" && recruiterAccessiblePaths.includes(currentPath)) {
            return;
        }

        // Already on a protected recruiter page — let RecruiterRoute handle auth
        if (role === "RECRUITER" && (currentPath === "/hire" || currentPath.startsWith("/hire/"))) {
            return;
        }

        // Already on a protected candidate page — let CandidateRoute handle auth
        const candidateProtectedPaths = [
            "/dashboard",
            "/profile",
            "/applications",
            "/interviews",
            "/messages",
            "/ai-auto-apply",
        ];
        if (role === "CANDIDATE" && candidateProtectedPaths.includes(currentPath)) {
            return;
        }

        // Redirect to the appropriate dashboard
        if (role === "RECRUITER") {
            navigate("/hire/dashboard", { replace: true });
        } else if (role === "CANDIDATE") {
            navigate("/dashboard", { replace: true });
        } else if (role === "ADMIN") {
            navigate("/admin", { replace: true });
        }
    }, [navigate, location.pathname]);

    return null;
};

export default AuthRedirect;
