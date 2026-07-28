import React, { useState } from "react";
import { FaArrowRight, FaEnvelope, FaEdit, FaShieldAlt, FaSpinner, FaUserShield } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getOTP, verifyOTP } from "../../services/UserService";
import { seedAdminUser } from "../../services/AdminService";
import { useToast } from "../../components/Toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [step, setStep] = useState("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");

  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return "Email address is required";
    if (!regex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const handleSendOtp = async () => {
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }
    setEmailError("");

    try {
      setLoading(true);
      await getOTP(email, "ADMIN");
      localStorage.setItem("email", email);
      setTimeout(() => {
        setLoading(false);
        setStep("OTP");
      }, 1000);
    } catch (error) {
      setLoading(false);
      setEmailError("Failed to send OTP.");
      addToast("Failed to send OTP. Please try again.", "error");
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setOtp(value);
    }
    if (otpError) setOtpError("");
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const savedEmail = localStorage.getItem("email");
      const response = await verifyOTP(savedEmail, otp);

      localStorage.setItem("role", response.role);
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("profileCompleted", response.profileCompleted ? "true" : "false");

      setLoading(false);

      if (response.role === "ADMIN") {
        addToast("Welcome Admin!", "success");
        navigate("/admin/dashboard");
      } else {
        addToast("Invalid admin credentials.", "error");
        navigate("/");
      }
    } catch (error) {
      setLoading(false);
      setOtpError("Invalid OTP");
      addToast("Invalid OTP. Please try again.", "error");
    }
  };

  const handleSeedAdmin = async () => {
    setSeeding(true);
    try {
      await seedAdminUser();
      addToast("Admin user created! Email: admin@admin.com", "success");
    } catch (error) {
      addToast(
        error.response?.data || "Admin may already exist. Try signing in.",
        "info"
      );
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center px-4 py-10">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <FaUserShield className="text-4xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            IT Job Hunt
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <FaShieldAlt className="text-blue-400 text-sm" />
            <span className="text-blue-300 text-sm font-medium tracking-wider uppercase">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-800 rounded-2xl border border-slate-600 shadow-xl shadow-black/20 p-8">
          {step === "EMAIL" ? (
            <>
              {/* Header */}
              <h2 className="text-2xl font-bold text-white">
                Admin Sign In
              </h2>
              <p className="text-slate-400 mt-2 text-sm">
                Enter your admin email address to continue.
              </p>

              {/* Email Field */}
              <div className="mt-8">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div
                  className={`flex items-center border rounded-xl px-4 h-12 transition bg-slate-700/50 ${
                    emailError
                      ? "border-red-500"
                      : "border-slate-600"
                  }`}
                >
                  <FaEnvelope className="text-slate-400 mr-3 shrink-0" />
                  <input
                    type="email"
                    placeholder="admin@admin.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    className="w-full outline-none bg-transparent text-white placeholder-slate-500"
                  />
                </div>
                {emailError && (
                  <p className="text-red-400 text-sm mt-2">{emailError}</p>
                )}
              </div>

              {/* Continue Button */}
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className={`w-full mt-6 h-12 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-blue-800 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                }`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Continue
                    <FaArrowRight size={14} />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-slate-600"></div>
                <span className="px-3 text-sm text-slate-500">OR</span>
                <div className="flex-1 border-t border-slate-600"></div>
              </div>

              {/* Seed Admin Button */}
              <button
                onClick={handleSeedAdmin}
                disabled={seeding}
                className="w-full border border-slate-600 h-12 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-700/50 transition text-slate-300 font-medium disabled:opacity-50"
              >
                {seeding ? (
                  <>
                    <FaSpinner className="animate-spin text-blue-400" />
                    <span>Initializing...</span>
                  </>
                ) : (
                  <>
                    <FaShieldAlt className="text-blue-400" />
                    <span>Initialize Admin (First Time Setup)</span>
                  </>
                )}
              </button>
              <p className="text-xs text-slate-500 mt-3 text-center">
                First time? Click to create default admin account.
                <br />
                Default email: <span className="text-blue-400 font-mono">admin@admin.com</span>
              </p>
            </>
          ) : (
            <>
              {/* OTP Header */}
              <h2 className="text-2xl font-bold text-white">
                Verify your email
              </h2>
              <p className="text-slate-400 mt-2 text-sm">
                We've sent a 6-digit verification code to:
              </p>

              {/* Email Display */}
              <div className="flex items-center justify-between bg-slate-700/50 rounded-xl px-4 py-3 mt-5 border border-slate-600">
                <span className="font-medium text-white">{email}</span>
                <button
                  onClick={() => {
                    setStep("EMAIL");
                    setOtp("");
                  }}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <FaEdit />
                </button>
              </div>

              {/* OTP Input */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="123456"
                  maxLength={6}
                  className={`w-full h-12 border rounded-xl text-center text-xl tracking-[8px] outline-none transition bg-slate-700/50 text-white placeholder-slate-500 ${
                    otpError
                      ? "border-red-500"
                      : "border-slate-600 "
                  }`}
                />
                {otpError && (
                  <p className="text-red-400 text-sm mt-2">{otpError}</p>
                )}
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className={`w-full mt-6 h-12 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-blue-800 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                }`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>

              {/* Resend OTP */}
              <div className="mt-5 text-center">
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-blue-400 text-sm hover:text-blue-300 hover:underline disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Resend OTP"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-slate-500 text-sm hover:text-slate-300 transition"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
