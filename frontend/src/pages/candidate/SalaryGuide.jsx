import React from "react";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaChevronDown,
  FaMoneyBillWave
} from "react-icons/fa";

const jobs = [
  {
    title: "Software Engineer",
    salary: "₹8,50,000/year",
    openings: "12,450 jobs"
  },
  {
    title: "Java Developer",
    salary: "₹7,20,000/year",
    openings: "9,320 jobs"
  },
  {
    title: "Data Analyst",
    salary: "₹6,80,000/year",
    openings: "6,870 jobs"
  },
  {
    title: "DevOps Engineer",
    salary: "₹9,40,000/year",
    openings: "5,140 jobs"
  },
  {
    title: "Full Stack Developer",
    salary: "₹8,80,000/year",
    openings: "8,230 jobs"
  },
  {
    title: "Cloud Engineer",
    salary: "₹10,50,000/year",
    openings: "4,210 jobs"
  }
];

const SalaryGuide = () => {
  return (
    <div className="bg-[#f5f5f5] min-h-screen">

      {/* Hero Section */}
      <section className="bg-[#0B3EA9] pb-28">
        <div className="max-w-6xl mx-auto px-6 pt-14 text-white">

          <h1 className="text-5xl font-bold">
            Discover your earning potential
          </h1>

          <p className="mt-4 text-xl text-blue-100">
            Explore high-paying careers, salaries and job openings by
            industry and location.
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-6xl mx-auto px-6 relative top-12">
          <div className="bg-white rounded-3xl shadow-lg p-8">

            <div className="grid md:grid-cols-3 gap-4">

              {/* What */}
              <div>
                <label className="font-semibold text-gray-700 mb-2 block">
                  What
                </label>

                <div className="border rounded-2xl flex items-center px-4 py-4">
                  <FaSearch className="text-gray-400 mr-3" />

                  <input
                    type="text"
                    placeholder="Job title"
                    className="w-full outline-none"
                  />
                </div>
              </div>

              {/* Where */}
              <div>
                <label className="font-semibold text-gray-700 mb-2 block">
                  Where
                </label>

                <div className="border rounded-2xl flex items-center px-4 py-4">
                  <FaMapMarkerAlt className="text-gray-400 mr-3" />

                  <input
                    type="text"
                    placeholder="India"
                    className="w-full outline-none"
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button className="w-full bg-[#2557A7] text-white py-4 rounded-2xl font-semibold text-lg hover:bg-blue-800 transition">
                  Search
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Salary by Industry */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">

        <h2 className="text-4xl font-bold text-gray-900 mb-10">
          Browse top-paying jobs by industry
        </h2>

        {/* Filter */}
        <div className="mb-12">
          <label className="font-semibold text-gray-800 block mb-3">
            Choose an industry
          </label>

          <div className="w-80 bg-white border rounded-xl px-5 py-4 flex justify-between items-center cursor-pointer">
            <span>All Industries</span>
            <FaChevronDown />
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {jobs.map((job, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition"
            >
              <div className="text-[#2557A7] text-3xl mb-5">
                <FaMoneyBillWave />
              </div>

              <h3 className="text-2xl font-semibold text-gray-900">
                {job.title}
              </h3>

              <p className="mt-4 text-3xl font-bold text-[#2557A7]">
                {job.salary}
              </p>

              <p className="mt-3 text-gray-600">
                Average annual salary in India
              </p>

              <div className="mt-6 pt-4 border-t text-gray-500">
                {job.openings}
              </div>

              <button className="mt-6 w-full border border-[#2557A7] text-[#2557A7] py-3 rounded-xl font-medium hover:bg-blue-50 transition">
                View Salary Details
              </button>
            </div>
          ))}

        </div>
      </section>

      {/* Insights Section */}
      <section className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">

          <h2 className="text-4xl font-bold text-gray-900">
            Salary insights for smarter career decisions
          </h2>

          <p className="text-gray-600 text-lg mt-6 max-w-3xl mx-auto leading-8">
            Compare salaries by role, experience, location and industry
            to understand your market value and negotiate confidently.
          </p>

          <button className="mt-10 bg-[#2557A7] text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-800 transition">
            Explore Salaries
          </button>

        </div>
      </section>

    </div>
  );
};

export default SalaryGuide;