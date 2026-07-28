import React from "react";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaArrowRight,
  FaRobot,
  FaShieldAlt,
  FaBolt,
  FaUsers,
  FaStar,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CandidateHome = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaRobot className="text-3xl" />,
      title: "AI Auto-Apply",
      desc: "Let AI match your skills with perfect job opportunities and apply with one click.",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      icon: <FaBolt className="text-3xl" />,
      title: "Smart Matching",
      desc: "Get personalized job recommendations based on your skills, experience, and preferences.",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: <FaShieldAlt className="text-3xl" />,
      title: "Secure & Fast",
      desc: "Passwordless OTP login, real-time messaging, and seamless application tracking.",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      icon: <FaUsers className="text-3xl" />,
      title: "Direct Connect",
      desc: "Communicate directly with recruiters, schedule interviews, and get hired faster.",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Jobs" },
    { value: "5K+", label: "Companies" },
    { value: "50K+", label: "Candidates" },
    { value: "95%", label: "Satisfaction" },
  ];

  const steps = [
    { num: "1", title: "Create Account", desc: "Sign up in seconds with your email — no password needed." },
    { num: "2", title: "Build Profile", desc: "Add your skills, experience, and preferences to get matched." },
    { num: "3", title: "Get Matched", desc: "AI finds the best jobs tailored to your unique profile." },
    { num: "4", title: "Apply & Grow", desc: "Apply with one click and track every application seamlessly." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ========== HERO SECTION ========== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/5 animate-float" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/5 animate-float" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full bg-white/5 animate-float" style={{ animationDelay: "3s" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Hero Content */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft" />
                <span className="text-sm text-blue-100 font-medium">AI-Powered Job Platform</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                Your next IT job
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">
                  starts here
                </span>
              </h1>

              <p className="mt-6 text-lg md:text-xl text-blue-100 max-w-xl leading-relaxed">
                Thousands of IT opportunities curated for you. Let AI match your
                skills with the perfect role — smarter, faster, better.
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <button
                  onClick={() => navigate("/login")}
                  className="group inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-3.5 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  Get Started Free
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/25 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  Learn More
                </button>
              </div>

              <div className="flex items-center gap-4 mt-10 text-sm text-blue-200">
                <div className="flex items-center gap-1.5">
                  <FaCheckCircle className="text-green-400" />
                  <span>No spam</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaCheckCircle className="text-green-400" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaCheckCircle className="text-green-400" />
                  <span>Privacy first</span>
                </div>
              </div>
            </div>

            {/* Right: Search Card Visual */}
            <div className="hidden lg:flex justify-center animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <div className="w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
                      <FaSearch className="text-2xl text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Quick Search</h3>
                      <p className="text-sm text-blue-200">Find your dream role</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3.5 border border-white/10">
                      <FaSearch className="text-blue-200 shrink-0" />
                      <input type="text" placeholder="Job title, skills or company..." className="w-full bg-transparent text-white placeholder:text-blue-200/60 outline-none text-sm" readOnly />
                    </div>
                    <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3.5 border border-white/10">
                      <FaMapMarkerAlt className="text-blue-200 shrink-0" />
                      <input type="text" placeholder="Location..." className="w-full bg-transparent text-white placeholder:text-blue-200/60 outline-none text-sm" readOnly />
                    </div>
                    <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3.5 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg">
                      Search Jobs
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-5">
                    <span className="bg-white/10 text-blue-100 text-xs px-3 py-1.5 rounded-full">React</span>
                    <span className="bg-white/10 text-blue-100 text-xs px-3 py-1.5 rounded-full">Java</span>
                    <span className="bg-white/10 text-blue-100 text-xs px-3 py-1.5 rounded-full">Python</span>
                    <span className="bg-white/10 text-blue-100 text-xs px-3 py-1.5 rounded-full">DevOps</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60V20C240 0 480 0 720 20C960 40 1200 40 1440 20V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ========== STATS SECTION ========== */}
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

      {/* ========== FEATURES SECTION ========== */}
      <section id="features" className="section-padding bg-gray-50">
        <div className="content-container">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <FaStar className="text-sm" />
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Built for <span className="gradient-text">modern job seekers</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to land your next IT role — powered by AI and designed for speed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {features.map((feature, i) => (
              <div key={i} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 p-8">
                <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} ${feature.iconColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="section-padding bg-white">
        <div className="content-container">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <FaBolt className="text-sm" />
              Simple Process
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Get hired in <span className="gradient-text">4 easy steps</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              From sign-up to your first job offer — we make it effortless.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-200 via-indigo-300 to-purple-200" />

            {steps.map((step, i) => (
              <div key={i} className="relative text-center group">
                <div className="relative z-10 w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 mb-6">
                  <span className="text-3xl font-bold text-white">{step.num}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white/5 animate-float" />
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-white/5 animate-float" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to find your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">
              dream job?
            </span>
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of IT professionals who've found their perfect role through our platform.
            It's free, fast, and powered by AI.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="group inline-flex items-center gap-3 bg-white text-blue-700 px-10 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Create Free Account
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-blue-200">
            <span className="flex items-center gap-1.5"><FaCheckCircle /> No credit card</span>
            <span className="flex items-center gap-1.5"><FaCheckCircle /> 2-minute setup</span>
            <span className="flex items-center gap-1.5"><FaCheckCircle /> AI matching</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CandidateHome;