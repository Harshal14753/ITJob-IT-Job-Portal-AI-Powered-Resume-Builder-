import React from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUserTie,
    FaUsers,
    FaSearch,
    FaChartLine,
    FaComments,
    FaBriefcase,
    FaCheckCircle,
    FaArrowRight,
    FaBolt,
    FaBullseye,
    FaRocket,
    FaStar
} from "react-icons/fa";

const EmployeeHome = () => {
  const navigate = useNavigate();

    const dashboardFeatures = [
        {
            icon: <FaUsers className="text-3xl" />,
            title: "Applicant Tracking",
            desc: "Manage all candidates from a single dashboard.",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
        },
        {
            icon: <FaComments className="text-3xl" />,
            title: "Messaging",
            desc: "Communicate directly with applicants.",
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
        },
        {
            icon: <FaChartLine className="text-3xl" />,
            title: "Analytics",
            desc: "Track application and hiring performance.",
            iconBg: "bg-purple-100",
            iconColor: "text-purple-600",
        },
    ];

    const hiringFeatures = [
        { icon: <FaRocket className="text-2xl" />, title: "Post a Job", desc: "Reach thousands of IT professionals instantly." },
        { icon: <FaSearch className="text-2xl" />, title: "Find Quality Applicants", desc: "Screen and shortlist candidates faster." },
        { icon: <FaComments className="text-2xl" />, title: "Make Connections", desc: "Invite candidates and schedule interviews." },
        { icon: <FaBullseye className="text-2xl" />, title: "Hire Confidently", desc: "Resources and guidance throughout hiring." },
    ];

  const stats = [
    { value: "10K+", label: "Active Candidates" },
    { value: "50K+", label: "Jobs Posted" },
    { value: "95%", label: "Satisfaction" },
    { value: "3hrs", label: "Avg. Hire Time" },
  ];

    return (
        <div className="min-h-screen bg-white">

            {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-white/5 animate-float" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5 animate-float" style={{ animationDelay: "2s" }} />
        </div>

                <div className="relative max-w-7xl mx-auto px-8 py-20 md:py-28 grid lg:grid-cols-2 gap-12 items-center">

                    <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft" />
                <span className="text-sm font-medium">Trusted by 5,000+ recruiters</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Hire your next great candidate.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200"> Fast.</span>
              </h1>

              <p className="mt-6 text-lg md:text-xl text-blue-100 max-w-xl">
                No matter the skills, experience or qualifications,
                you'll find the right people here — powered by AI matching.
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <button
                  onClick={() => navigate("/hire/login")}
                  className="group inline-flex items-center gap-2 bg-amber-400 text-gray-900 px-8 py-3.5 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  Start Hiring
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate("/hire/login")}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/25 px-8 py-3.5 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  Post a Job
                </button>
              </div>

              <div className="flex items-center gap-4 mt-8 text-sm text-blue-200">
                <span className="flex items-center gap-1.5"><FaCheckCircle className="text-green-400" /> AI matching</span>
                <span className="flex items-center gap-1.5"><FaCheckCircle className="text-green-400" /> Verified profiles</span>
                <span className="flex items-center gap-1.5"><FaCheckCircle className="text-green-400" /> Free to start</span>
              </div>
                    </div>

                    <div className="hidden lg:flex justify-center animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-10 shadow-2xl text-center">
                <div className="w-36 h-36 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-yellow-300 flex items-center justify-center shadow-2xl mb-6">
                  <FaUserTie className="text-6xl text-gray-800" />
                </div>
                <p className="text-xl font-bold">Find Your Next Hire</p>
                <p className="text-sm text-blue-200 mt-2">AI-powered candidate sourcing</p>
                <div className="flex gap-2 mt-5 justify-center">
                  <span className="bg-white/15 text-xs px-3 py-1.5 rounded-full">React Dev</span>
                  <span className="bg-white/15 text-xs px-3 py-1.5 rounded-full">Java</span>
                  <span className="bg-white/15 text-xs px-3 py-1.5 rounded-full">DevOps</span>
                </div>
              </div>
                    </div>

                </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60V20C240 0 480 0 720 20C960 40 1200 40 1440 20V60H0Z" fill="white" />
          </svg>
        </div>
            </section>

      {/* Stats */}
      <section className="relative -mt-6 z-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 grid grid-cols-2 md:grid-cols-4 gap-8 card-hover">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hiring Process */}
      <section className="section-padding bg-white">
                <div className="content-container">

          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <FaBolt className="text-sm" />
              Hiring Process
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Manage your hiring{" "}
              <span className="gradient-text">from start to finish</span>
            </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-children">

                        {hiringFeatures.map((item, index) => (
                            <div key={index} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 p-8 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {item.title}
                                </h3>
                                <p className="text-gray-500 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

      {/* Dashboard Features */}
      <section className="section-padding bg-gray-50">
                <div className="content-container">

          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <FaStar className="text-sm" />
              Dashboard Tools
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Everything at your{" "}
              <span className="gradient-text">fingertips</span>
            </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 stagger-children">
                        {dashboardFeatures.map((feature, index) => (
                            <div
                                key={index}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 p-10 text-center"
                            >
                <div className={`w-16 h-16 mx-auto rounded-2xl ${feature.iconBg} ${feature.iconColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    {feature.icon}
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    {feature.title}
                                </h3>

                <p className="text-gray-500 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

      {/* Smart Sourcing */}
      <section className="section-padding bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="content-container text-center">

          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 mb-8">
            <FaSearch className="text-3xl text-white" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Unlock matched candidates with{" "}
            <span className="gradient-text">Smart Sourcing</span>
          </h2>

          <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
            AI-powered sourcing automatically recommends
            candidates whose skills and experience match
            your job requirements — saving you hours of manual screening.
          </p>

          <button
            onClick={() => navigate("/hire/login")}
            className="group mt-10 inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Try Smart Sourcing
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
                </div>
            </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-800 py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white/5 animate-float" />
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-white/5 animate-float" style={{ animationDelay: "2s" }} />
        </div>

                <div className="relative max-w-4xl mx-auto text-center px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to build your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-200">dream team?</span>
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Interview guides, onboarding checklists,
            salary insights and recruitment strategies
            to support your hiring journey.
          </p>
          <button
            onClick={() => navigate("/hire/login")}
            className="group inline-flex items-center gap-3 bg-amber-400 text-gray-900 px-10 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Get Started Free
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
                </div>
            </section>

        </div>
    );
};

export default EmployeeHome;