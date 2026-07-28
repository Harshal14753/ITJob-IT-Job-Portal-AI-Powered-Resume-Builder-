import React, { useContext } from "react";
import {
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaInstagram,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { UserDataContext } from "../context/UserContext";
import { SiteConfigContext } from "../context/SiteConfigContext";

const Footer = () => {
  const { isCandidate } = useContext(UserDataContext);
  const { websiteName, companyName, supportEmail, contactNumber } = useContext(SiteConfigContext);

  const role = localStorage.getItem("role");

  // Admin dark footer
  if (role === "ADMIN") {
    return (
      <footer className="w-full bg-slate-800 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold text-white mb-2">{websiteName}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Admin Panel — Manage users, jobs, skills, and platform settings.
              </p>
              {(supportEmail || contactNumber) && (
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
                  {supportEmail && (
                    <a href={`mailto:${supportEmail}`} className="flex items-center gap-1.5 hover:text-blue-400 transition">
                      <FaEnvelope className="text-xs" />
                      {supportEmail}
                    </a>
                  )}
                  {contactNumber && (
                    <a href={`tel:${contactNumber.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-blue-400 transition">
                      <FaPhone className="text-xs" />
                      {contactNumber}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Manage</h4>
              <div className="flex flex-col gap-2 text-sm">
                <a href="/admin" className="text-slate-400 hover:text-white transition">Dashboard</a>
                <a href="/admin/users" className="text-slate-400 hover:text-white transition">Users</a>
                <a href="/admin/jobs" className="text-slate-400 hover:text-white transition">Jobs</a>
                <a href="/admin/skills" className="text-slate-400 hover:text-white transition">Skills</a>
              </div>
            </div>

            {/* Settings */}
            <div>
              <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">System</h4>
              <div className="flex flex-col gap-2 text-sm">
                <a href="/admin/contacts" className="text-slate-400 hover:text-white transition">Contacts</a>
                <a href="/admin/config" className="text-slate-400 hover:text-white transition">Settings</a>
                <a href="/contact" className="text-slate-400 hover:text-white transition">Support</a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} {websiteName}. All rights reserved.
            </p>
            <div className="flex gap-5 text-lg text-slate-500">
              <FaFacebook className="cursor-pointer hover:text-blue-400 transition" />
              <FaLinkedin className="cursor-pointer hover:text-blue-400 transition" />
              <FaYoutube className="cursor-pointer hover:text-red-400 transition" />
              <FaInstagram className="cursor-pointer hover:text-pink-400 transition" />
            </div>
          </div>
        </div>
      </footer>
    );
  }

  const candidateLinks = [
    "Career Advice",
    "Browse Jobs",
    "Browse Companies",
    "Salaries",
    "Events",
    `Work at ${websiteName}`,
    "Countries",
    "About",
    "Help",
    `ESG at ${websiteName}`,
    "Guidelines for Safe Job Search"
  ];

  const candidateBottomLinks = [
    "Accessibility",
    "Privacy Centre and Ad Choices",
    "Terms",
  ];

  return (
    <>
      {isCandidate ? (
        /* ================= Candidate Footer ================= */
        <footer className="w-full bg-[#f3f2f1] border-t border-gray-300">
          <div className="max-w-7xl mx-auto px-8 py-8">
            {/* Top Links */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-700">
              {candidateLinks.map((link, index) => (
                <button
                  key={index}
                  className="hover:text-[#2557A7] transition duration-200"
                >
                  {link}
                </button>
              ))}
            </div>

            {/* Bottom Links */}
            {/* Contact Info */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
            {supportEmail && (
              <a
                href={`mailto:${supportEmail}`}
                className="flex items-center gap-1.5 hover:text-[#2557A7] transition duration-200"
              >
                <FaEnvelope className="text-xs" />
                {supportEmail}
              </a>
            )}
            {contactNumber && (
              <a
                href={`tel:${contactNumber.replace(/\s/g, "")}`}
                className="flex items-center gap-1.5 hover:text-[#2557A7] transition duration-200"
              >
                <FaPhone className="text-xs" />
                {contactNumber}
              </a>
            )}
            <a href="/contact" className="hover:text-[#2557A7] transition duration-200">
              Contact Us
            </a>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-gray-600">
              <span>
                © {new Date().getFullYear()} {websiteName}
              </span>

              {candidateBottomLinks.map((link, index) => (
                <React.Fragment key={index}>
                  <span className="text-gray-400 hidden md:block">|</span>

                  <button className="hover:text-[#2557A7] transition duration-200">
                    {link}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </footer>
      ) : (
        /* ================= Employer Footer ================= */
        <footer className="bg-gray-50 border-t border-gray-200">
          {/* Top Section */}
          <div className="max-w-7xl mx-auto px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

              {/* Help Section */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  We're here to help
                </h2>

                <p className="text-gray-600 text-sm leading-6 mb-5 max-w-xl">
                  Visit our Help Centre for answers to common questions
                  or contact our support team directly.
                </p>

                <div className="flex gap-3">
                  <button className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-blue-700 font-medium hover:bg-gray-100 transition">
                    Help Centre
                  </button>                        <button onClick={() => window.location.href = '/contact'} className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-blue-700 font-medium hover:bg-gray-100 transition">
                            Contact Support
                        </button>
                </div>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {companyName}
                </h3>                  <div className="flex flex-col gap-2 text-sm text-gray-600">
                  <a href="/" className="hover:text-blue-700">Home</a>
                  <a href="/contact" className="hover:text-blue-700">Contact Us</a>
                  <a href="/about" className="hover:text-blue-700">About</a>
                  <a href="#" className="hover:text-blue-700">Privacy</a>
                  <a href="#" className="hover:text-blue-700">Sitemap</a>
                </div>
              </div>

              {/* Employers */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Employers
                </h3>

                <div className="flex flex-col gap-2 text-sm text-gray-600">
                  <a href="#" className="hover:text-blue-700">Post a Job</a>
                  <a href="#" className="hover:text-blue-700">Pricing</a>
                  <a href="#" className="hover:text-blue-700">Products</a>
                  <a href="#" className="hover:text-blue-700">Resources</a>
                  <a href="#" className="hover:text-blue-700">FAQ</a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">

              {/* Compliance */}
              <div className="flex gap-6 text-xs text-gray-500">
                <span>GDPR Compliant</span>
                <span>ISO 9001</span>
                <span>ISO 27001</span>
              </div>

              {/* Copyright */}
              <div className="text-sm text-gray-500">
                © {new Date().getFullYear()} {companyName}
              </div>

              {/* Social Icons */}
              <div className="flex gap-5 text-xl text-gray-500">
                <FaFacebook className="cursor-pointer hover:text-blue-600 transition" />
                <FaLinkedin className="cursor-pointer hover:text-blue-700 transition" />
                <FaYoutube className="cursor-pointer hover:text-red-600 transition" />
                <FaInstagram className="cursor-pointer hover:text-pink-600 transition" />
              </div>

            </div>
          </div>
        </footer>
      )}
    </>
  );
};

export default Footer;