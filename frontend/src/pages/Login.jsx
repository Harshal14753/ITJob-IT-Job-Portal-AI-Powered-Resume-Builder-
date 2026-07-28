import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaArrowRight, FaEnvelope, FaEdit } from "react-icons/fa";
import { UserDataContext } from "../context/UserContext";
import { useContext } from "react";
import { getOTP, verifyOTP } from "../services/UserService";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";

const Login = () => {

  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isCandidate } = useContext(UserDataContext);
  
  const [step, setStep] = useState("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");

  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      return "Email address is required";
    }

    if (!regex.test(email)) {
      return "Please enter a valid email address";
    }

    return "";
  };

  const handleSendOtp = async () => {
    const error = validateEmail(email);

    if (error) {
      setEmailError(error);
      return;
    }

    setEmailError("");

    console.log("1. Candidate Mode:", isCandidate);
    const role = isCandidate
            ? "CANDIDATE"
            : "RECRUITER";

    try {
      setLoading(true);
      
      const response = await getOTP(email, role);
      localStorage.setItem("email", email);

      // Temporary delay for UI testing
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

    if (otpError) {
      setOtpError("");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const email = localStorage.getItem("email");
      const response = await verifyOTP(email, otp);

      localStorage.setItem("role", response.role);
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem(
        "profileCompleted",
        response.profileCompleted ? "true" : "false"
      );

      setLoading(false);

      console.log("User Role:", response.role);

      if (response.role === "RECRUITER") {
        if (response.profileCompleted) {
          navigate("/hire");
        } else {
          navigate("/hire/profile-setup");
        }
      } else {
        if (response.profileCompleted) {
          navigate("/");
        } else {
          // First time — show profile setup choice page
          navigate("/profile-setup-choice");
        }
      }

    } catch (error) {
      
      setLoading(false);
      setOtpError("Invalid OTP");
      addToast("Invalid OTP. Please try again.", "error");
    }
  };    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex justify-center items-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 mb-4">
            <span className="text-2xl font-bold text-white">IH</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to IT Job Hunt
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Your career starts here
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8 animate-slide-down">
          {step === "EMAIL" ? (
            <>
              {/* Header */}
              <h2 className="text-3xl font-semibold text-gray-900">
                Create your account
              </h2>

              <p className="text-gray-600 mt-2">
                Enter your email address to continue.
              </p>

              {/* Email Field */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>

                <div
                  className={`flex items-center border rounded-lg px-4 h-12 transition ${
                    emailError
                      ? "border-red-500"
                      : "border-gray-300 focus-within:ring-2 focus-within:ring-gray-100"
                  }`}
                >
                  <FaEnvelope className="text-gray-400 mr-3" />

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    className="w-full outline-none"
                  />
                </div>

                {emailError && (
                  <p className="text-red-500 text-sm mt-2">
                    {emailError}
                  </p>
                )}
              </div>

              {/* Continue Button */}
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className={`w-full mt-6 h-12 rounded-lg font-medium text-white transition flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-[#2557A7] hover:bg-[#1d4fa3]"
                }`}
              >
                {loading ? (
                  "Sending OTP..."
                ) : (
                  <>
                    Continue
                    <FaArrowRight size={14} />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-300"></div>

                <span className="px-3 text-sm text-gray-500">
                  OR
                </span>

                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Google Login */}
              <button className="w-full border border-gray-300 h-12 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition">
                <FcGoogle className="text-2xl" />

                <span className="font-medium">
                  Continue with Google
                </span>
              </button>

              {/* Terms */}
              <p className="text-xs text-gray-500 mt-6 leading-5">
                By continuing, you agree to our{" "}
                <span className="text-[#2557A7] cursor-pointer hover:underline">
                  Terms
                </span>{" "}
                and{" "}
                <span className="text-[#2557A7] cursor-pointer hover:underline">
                  Privacy Policy
                </span>.
              </p>
            </>
          ) : (
            <>
              {/* OTP Header */}
              <h2 className="text-3xl font-semibold text-gray-900">
                Verify your email
              </h2>

              <p className="text-gray-600 mt-2">
                We've sent a 6-digit verification code to:
              </p>

              {/* Email Display */}
              <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-3 mt-5">
                <span className="font-medium text-gray-800">
                  {email}
                </span>

                <button
                  onClick={() => {
                    setStep("EMAIL");
                    setOtp("");
                  }}
                  className="text-[#2557A7] hover:text-blue-700"
                >
                  <FaEdit />
                </button>
              </div>

              {/* OTP Input */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>

                <input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="123456"
                  maxLength={6}
                  className={`w-full h-12 border rounded-lg text-center text-xl tracking-[8px] outline-none transition ${
                    otpError
                      ? "border-red-500"
                      : "border-gray-300 "
                  }`}
                />

                {otpError && (
                  <p className="text-red-500 text-sm mt-2">
                    {otpError}
                  </p>
                )}
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className={`w-full mt-6 h-12 rounded-lg text-white font-medium transition ${
                  loading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-[#2557A7] hover:bg-[#1d4fa3]"
                }`}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              {/* Resend OTP */}
              <div className="mt-5 text-center">
                <button className="text-[#2557A7] text-sm hover:underline">
                  Resend OTP
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;