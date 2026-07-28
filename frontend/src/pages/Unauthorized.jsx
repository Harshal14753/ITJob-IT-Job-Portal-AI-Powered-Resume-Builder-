import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaLock, FaArrowLeft, FaHome, FaSignInAlt } from "react-icons/fa";

const Unauthorized = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "candidate";

  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  // If user is not logged in, auto-redirect to the appropriate login page
  useEffect(() => {
    if (!token) {
      let loginPath = "/login";
      if (type === "recruiter") loginPath = "/hire/login";
      else if (type === "admin") loginPath = "/admin/login";
      navigate(loginPath, { replace: true });
    }
  }, [token, type, navigate]);

  // Don't render anything if not logged in — the redirect will happen
  if (!token) {
    return null;
  }

  const handleGoHome = () => {
    if (role === "RECRUITER") {
      navigate("/hire/dashboard");
    } else if (role === "CANDIDATE") {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSignIn = () => {
    const loginPath =
      type === "recruiter" ? "/hire/login" : "/login";
    navigate(loginPath);
  };

  const isRecruiterPage = type === "recruiter";
  const isAdminPage = type === "admin";

  // Admin unauthorized — special case
  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-6">
            <FaLock className="text-red-400 text-4xl" />
          </div>
          <h1 className="text-7xl font-bold text-slate-700 mb-2">403</h1>
          <h2 className="text-2xl font-bold text-white mb-3">Access Forbidden</h2>
          <p className="text-gray-400 mb-2">You do not have permission to access this admin page.</p>
          <p className="text-gray-500 mb-8">Admin privileges are required.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={handleGoBack} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-600 text-gray-300 font-medium hover:bg-slate-800 transition">
              <FaArrowLeft /> Go Back
            </button>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-700">
            <p className="text-sm text-gray-500 mb-3">Not an admin?</p>
            <button onClick={() => navigate("/admin/login")} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-600 text-gray-300 font-medium hover:bg-slate-800 transition text-sm">
              <FaSignInAlt /> Sign in as Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Lock Icon */}
        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <FaLock className="text-red-600 text-4xl" />
        </div>

        {/* Error Code */}
        <h1 className="text-7xl font-bold text-slate-200 mb-2">403</h1>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Access Forbidden
        </h2>

        {/* Description */}
        <p className="text-gray-500 mb-2">
          You do not have permission to access this{" "}
          {isRecruiterPage ? "employer" : "candidate"} page.
        </p>
        <p className="text-gray-500 mb-8">
          Your current account role does not have the required access.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGoBack}
            className="
              flex items-center justify-center gap-2
              px-6 py-3 rounded-xl border border-gray-300
              text-gray-700 font-medium hover:bg-gray-100
              transition
            "
          >
            <FaArrowLeft />
            Go Back
          </button>

          <button
            onClick={handleGoHome}
            className="
              flex items-center justify-center gap-2
              px-6 py-3 rounded-xl bg-[#2557A7] text-white
              font-medium hover:bg-blue-800
              transition
            "
          >
            <FaHome />
            Go to Dashboard
          </button>
        </div>

        {/* Switch account hint */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            Using the wrong account?
          </p>
          <button
            onClick={handleSignIn}
            className="
              inline-flex items-center gap-2
              px-5 py-2.5 rounded-xl border border-gray-300
              text-gray-700 font-medium hover:bg-gray-100
              transition text-sm
            "
          >
            <FaSignInAlt />
            Sign in as {isRecruiterPage ? "an Employer" : "a Candidate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
