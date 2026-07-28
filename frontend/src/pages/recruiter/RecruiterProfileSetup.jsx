import React, { useState } from "react";
import { FaBuilding, FaGlobe, FaBriefcase } from "react-icons/fa";
import { createRecruiterProfile } from "../../services/RecruiterService";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/Toast";

const RecruiterProfileSetup = () => {

  const navigate = useNavigate();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    companyName: "",
    companyWebsite: "",
    department: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ""
      });
    }
  };

  const validateForm = () => {

    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (
      formData.companyWebsite &&
      !/^https?:\/\/.+/.test(formData.companyWebsite)
    ) {
      newErrors.companyWebsite =
        "Please enter a valid website URL";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {

      setLoading(true);

      const response = await createRecruiterProfile({
        companyName: formData.companyName,
        companyWebsite: formData.companyWebsite,
        department: formData.department
      });

      addToast("Profile created successfully!", "success");
      navigate("/hire/dashboard");

    } catch (error) {
      console.log(error);
      addToast("Failed to create profile. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f2f1] flex justify-center items-center px-4 py-10">

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Complete your company profile
          </h1>

          <p className="text-gray-600 mt-2">
            Add your company information to start posting jobs and
            finding candidates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>

            <div
              className={`flex items-center border rounded-lg px-4 h-12 ${
                errors.companyName
                  ? "border-red-500"
                  : "border-gray-300 focus-within:border-[#2557A7]"
              }`}
            >
              <FaBuilding className="text-gray-400 mr-3" />

              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Example: Google"
                maxLength={255}
                className="w-full outline-none"
              />
            </div>

            {errors.companyName && (
              <p className="text-red-500 text-sm mt-2">
                {errors.companyName}
              </p>
            )}
          </div>

          {/* Company Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Website
            </label>

            <div
              className={`flex items-center border rounded-lg px-4 h-12 ${
                errors.companyWebsite
                  ? "border-red-500"
                  : "border-gray-300 focus-within:border-[#2557A7]"
              }`}
            >
              <FaGlobe className="text-gray-400 mr-3" />

              <input
                type="url"
                name="companyWebsite"
                value={formData.companyWebsite}
                onChange={handleChange}
                placeholder="https://company.com"
                maxLength={255}
                className="w-full outline-none"
              />
            </div>

            {errors.companyWebsite && (
              <p className="text-red-500 text-sm mt-2">
                {errors.companyWebsite}
              </p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>

            <div className="flex items-center border border-gray-300 rounded-lg px-4 h-12 focus-within:border-[#2557A7]">
              <FaBriefcase className="text-gray-400 mr-3" />

              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Engineering, HR, Talent Acquisition..."
                maxLength={255}
                className="w-full outline-none"
              />
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              Your company profile helps candidates trust your job
              postings and improves application quality.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-12 rounded-lg text-white font-medium transition ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-[#2557A7] hover:bg-[#1d4fa3]"
            }`}
          >
            {loading
              ? "Saving Profile..."
              : "Complete Profile"}
          </button>

        </form>

      </div>

    </div>
  );
};

export default RecruiterProfileSetup;