import React, { useState } from "react";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaEnvelope,
  FaBookmark,
  FaFilter,
  FaChevronDown,
} from "react-icons/fa";

const FindCV = () => {
  const [cvUpdated, setCvUpdated] = useState("within last 6 months");
  const [timeAtJob, setTimeAtJob] = useState("show all");
  const [availability, setAvailability] = useState("Available Immediately");
  const [experience, setExperience] = useState(1);

  const candidates = [
    {
      id: 1,
      title: "Java Developer",
      location: "Pune, Maharashtra",
      experience: "1 Year",
      company: "Infosys",
      education: "B.E Information Technology",
      availability: "Immediate Joiner",
      skills: ["Java", "Spring Boot", "MySQL"],
    },
    {
      id: 2,
      title: "Java Full Stack Developer",
      location: "Mumbai, Maharashtra",
      experience: "3 Years",
      company: "TCS",
      education: "B.Tech Computer Engineering",
      availability: "30 Days Notice",
      skills: ["React", "Spring Boot", "AWS"],
    },
    {
      id: 3,
      title: "Backend Developer",
      location: "Bangalore, Karnataka",
      experience: "2 Years",
      company: "Accenture",
      education: "B.Tech Information Technology",
      availability: "15 Days Notice",
      skills: ["Java", "Redis", "Docker"],
    },
    {
      id: 4,
      title: "Spring Boot Developer",
      location: "Hyderabad, Telangana",
      experience: "4 Years",
      company: "Wipro",
      education: "M.Tech Computer Science",
      availability: "Immediate Joiner",
      skills: ["Spring", "Kafka", "PostgreSQL"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa]">

      {/* Search Section */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 py-5">

          <div className="flex flex-wrap gap-4">

            {/* Job Search */}
            <div className="flex items-center flex-1 min-w-[350px] bg-white border border-gray-200 rounded-xl px-4 h-14 shadow-sm focus-within:ring-2 focus-within:ring-blue-100">
              <FaSearch className="text-gray-400 mr-3" />

              <input
                type="text"
                placeholder="Java Developer"
                className="w-full outline-none bg-transparent"
              />
            </div>

            {/* Location */}
            <div className="flex items-center w-[320px] bg-white border border-gray-200 rounded-xl px-4 h-14 shadow-sm focus-within:ring-2 focus-within:ring-blue-100">
              <FaMapMarkerAlt className="text-gray-400 mr-3" />

              <input
                type="text"
                placeholder="Pune, Maharashtra"
                className="w-full outline-none bg-transparent"
              />
            </div>

            <button className="bg-[#2557A7] hover:bg-blue-800 text-white px-8 rounded-xl font-medium shadow-sm transition">
              Find
            </button>

          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6 flex gap-6">

        {/* Sidebar */}
        <div className="w-[280px] hidden lg:block">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">

            <div className="flex items-center gap-2 mb-6">
              <FaFilter className="text-[#2557A7]" />
              <h2 className="text-lg font-semibold">Filters</h2>
            </div>

            {/* CV Updated */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                CV Last Updated
              </label>

              <select
                value={cvUpdated}
                onChange={(e) => setCvUpdated(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
              >
                <option>within last day</option>
                <option>within last 3 days</option>
                <option>within last week</option>
                <option>within last month</option>
                <option>within last 3 months</option>
                <option>within last 6 months</option>
              </select>
            </div>

            {/* Time At Job */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Time at Current Job
              </label>

              <select
                value={timeAtJob}
                onChange={(e) => setTimeAtJob(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
              >
                <option>show all</option>
                <option>greater than 3 months</option>
                <option>greater than 1 year</option>
                <option>greater than 2 years</option>
                <option>greater than 5 years</option>
                <option>greater than 10 years</option>
              </select>
            </div>

            {/* Availability */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Availability
              </label>

              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
              >
                <option>Available Immediately</option>
                <option>Within 15 Days</option>
                <option>Within 30 Days</option>
                <option>Within 60 Days</option>
              </select>
            </div>

            {/* Skills */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Skills
              </label>

              <input
                placeholder="Java, Spring Boot"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
              />
            </div>

            {/* Job Title */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Job Title
              </label>

              <input
                placeholder="Java Developer"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
              />
            </div>

            {/* Company */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Company
              </label>

              <input
                placeholder="Infosys"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Years of Experience
              </label>

              <input
                type="range"
                min="0"
                max="15"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full"
              />

              <p className="text-sm text-gray-500 mt-2">
                {experience}+ Years
              </p>
            </div>
          </div>
        </div>

        {/* Candidate List */}
        <div className="flex-1">

          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold text-gray-800">
              6,100 CVs match your criteria
            </h2>

            <button className="bg-white border border-gray-200 rounded-xl px-5 py-2 flex items-center gap-2 shadow-sm">
              Relevance
              <FaChevronDown className="text-sm" />
            </button>
          </div>

          <div className="space-y-3">

            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="
                  bg-white
                  rounded-xl
                  border
                  border-gray-100
                  shadow-sm
                  hover:shadow-md
                  transition
                  px-6
                  py-5
                "
              >
                <div className="grid grid-cols-12 gap-4 items-center">

                  {/* Job Title */}
                  <div className="col-span-4">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {candidate.title}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {candidate.location}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {candidate.skills.map((skill) => (
                        <span
                          key={skill}
                          className="
                            bg-blue-50
                            text-[#2557A7]
                            text-xs
                            px-3
                            py-1
                            rounded-full
                          "
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="col-span-3">
                    <p className="text-xs text-gray-500 uppercase mb-1">
                      Experience
                    </p>

                    <p className="font-medium text-gray-800">
                      {candidate.experience}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      {candidate.company}
                    </p>
                  </div>

                  {/* Education */}
                  <div className="col-span-3">
                    <p className="text-xs text-gray-500 uppercase mb-1">
                      Education
                    </p>

                    <p className="font-medium text-gray-800">
                      {candidate.education}
                    </p>

                    <p className="text-green-600 text-sm mt-1">
                      {candidate.availability}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="col-span-2 flex justify-end gap-3">
                    <button className="border border-gray-200 p-3 rounded-lg hover:bg-gray-50 transition">
                      <FaBookmark className="text-gray-600" />
                    </button>

                    <button
                      className="
                        bg-[#2557A7]
                        hover:bg-blue-800
                        text-white
                        px-5
                        py-2.5
                        rounded-lg
                        text-sm
                        font-medium
                        flex
                        items-center
                        gap-2
                        transition
                      "
                    >
                      <FaEnvelope />
                      Message
                    </button>
                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
};

export default FindCV;