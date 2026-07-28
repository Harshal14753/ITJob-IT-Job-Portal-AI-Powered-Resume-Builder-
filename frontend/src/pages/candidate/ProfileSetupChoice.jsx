import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCog, FaMagic, FaArrowRight } from "react-icons/fa";

const ProfileSetupChoice = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Complete Your Profile
                    </h1>
                    <p className="text-gray-500 text-lg">
                        How would you like to set up your profile?
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Manual Option */}
                    <button
                        onClick={() => navigate("/profile-setup")}
                        className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 p-8 text-left"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <FaUserCog className="text-blue-600 text-3xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            Manual Setup
                        </h2>
                        <p className="text-gray-500 leading-relaxed mb-6">
                            Fill in your profile details step by step. Add your personal info,
                            skills, experience, education, and more at your own pace.
                        </p>
                        <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                            <span>Get Started</span>
                            <FaArrowRight className="text-sm" />
                        </div>

                        {/* Features */}
                        <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                Full control over every field
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                Add multiple experiences & projects
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                Upload resume at the end
                            </div>
                        </div>
                    </button>

                    {/* AI Powered Option */}
                    <button
                        onClick={() => navigate("/ai-profile-setup")}
                        className="group bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 p-8 text-left relative overflow-hidden"
                    >
                        {/* Decorative gradient */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200/30 rounded-full translate-y-1/2 -translate-x-1/2" />

                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <FaMagic className="text-purple-600 text-3xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                AI-Powered Setup
                            </h2>
                            <p className="text-gray-500 leading-relaxed mb-6">
                                Upload your resume and let AI extract your details automatically.
                                Review and fix any mistakes before saving.
                            </p>
                            <div className="flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all">
                                <span>Upload Resume</span>
                                <FaArrowRight className="text-sm" />
                            </div>

                            {/* Features */}
                            <div className="mt-6 pt-6 border-t border-purple-200 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FaMagic className="text-purple-500 text-xs" />
                                    Parses PDF, DOC, DOCX resumes
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FaMagic className="text-purple-500 text-xs" />
                                    Extracts skills, experience, education & more
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FaMagic className="text-purple-500 text-xs" />
                                    Edit any mistakes before saving
                                </div>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Skip */}
                <div className="text-center mt-8">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="text-sm text-gray-400 hover:text-gray-600 transition underline underline-offset-2"
                    >
                        Skip for now — I'll do it later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetupChoice;
