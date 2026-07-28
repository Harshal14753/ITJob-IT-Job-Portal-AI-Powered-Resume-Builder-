import React from "react";
import {
  FaStar,
  FaSearch,
  FaMapMarkerAlt,
  FaBuilding
} from "react-icons/fa";

const companies = [
  {
    id: 1,
    name: "Google",
    rating: 4.6,
    reviews: "18,245",
    location: "Bangalore, India",
    industry: "Technology",
    description:
      "Excellent work culture, learning opportunities and employee benefits."
  },
  {
    id: 2,
    name: "Microsoft",
    rating: 4.5,
    reviews: "14,520",
    location: "Hyderabad, India",
    industry: "Technology",
    description:
      "Strong engineering culture with flexible work options and career growth."
  },
  {
    id: 3,
    name: "Infosys",
    rating: 4.1,
    reviews: "32,150",
    location: "Pune, India",
    industry: "IT Services",
    description:
      "Good starting point for freshers with diverse project opportunities."
  },
  {
    id: 4,
    name: "TCS",
    rating: 4.0,
    reviews: "48,960",
    location: "Mumbai, India",
    industry: "IT Services",
    description:
      "Large scale projects and stable career progression for employees."
  },
  {
    id: 5,
    name: "Amazon",
    rating: 4.3,
    reviews: "22,450",
    location: "Hyderabad, India",
    industry: "E-Commerce",
    description:
      "Fast-paced environment with challenging projects and competitive salary."
  },
  {
    id: 6,
    name: "Accenture",
    rating: 4.2,
    reviews: "28,340",
    location: "Bangalore, India",
    industry: "Consulting",
    description:
      "Great exposure to international projects and modern technologies."
  }
];

const CompanyReviews = () => {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-14">

          <h1 className="text-4xl font-bold text-gray-900">
            Company Reviews
          </h1>

          <p className="text-gray-600 mt-3 text-lg">
            Discover workplace insights from employees and find the best company for your career.
          </p>

          {/* Search Bar */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-300 flex flex-col md:flex-row overflow-hidden">

            <div className="flex items-center px-5 py-4 flex-1 border-b md:border-b-0 md:border-r">
              <FaSearch className="text-gray-400 mr-4" />
              <input
                type="text"
                placeholder="Company name or keyword"
                className="w-full outline-none"
              />
            </div>

            <div className="flex items-center px-5 py-4 flex-1 border-b md:border-b-0 md:border-r">
              <FaMapMarkerAlt className="text-gray-400 mr-4" />
              <input
                type="text"
                placeholder="Location"
                className="w-full outline-none"
              />
            </div>

            <button className="bg-[#2557A7] text-white px-10 py-4 font-semibold hover:bg-blue-800 transition">
              Search
            </button>

          </div>
        </div>
      </div>

      {/* Company Cards */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition duration-300"
            >

              {/* Header */}
              <div className="flex justify-between items-start">

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {company.name}
                  </h2>

                  <div className="flex items-center mt-2">
                    <FaStar className="text-yellow-500 mr-2" />

                    <span className="font-semibold">
                      {company.rating}
                    </span>

                    <span className="text-gray-500 ml-2">
                      ({company.reviews} reviews)
                    </span>
                  </div>
                </div>

                <FaBuilding className="text-3xl text-[#2557A7]" />

              </div>

              {/* Details */}
              <div className="mt-5 space-y-2 text-gray-600">
                <p>
                  <strong>Location:</strong> {company.location}
                </p>

                <p>
                  <strong>Industry:</strong> {company.industry}
                </p>
              </div>

              {/* Description */}
              <p className="mt-5 text-gray-700 leading-7">
                {company.description}
              </p>

              {/* Buttons */}
              <div className="mt-6 flex gap-3">

                <button className="flex-1 border border-[#2557A7] text-[#2557A7] py-2 rounded-lg font-medium hover:bg-blue-50 transition">
                  View Reviews
                </button>

                <button className="flex-1 bg-[#2557A7] text-white py-2 rounded-lg font-medium hover:bg-blue-800 transition">
                  View Jobs
                </button>

              </div>

            </div>
          ))}

        </div>

      </div>

      {/* CTA Section */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto text-center px-6 py-16">

          <h2 className="text-3xl font-bold text-gray-900">
            Looking for your next opportunity?
          </h2>

          <p className="text-gray-600 mt-4 text-lg">
            Explore thousands of IT jobs and company reviews on IT Job Hunt.
          </p>

          <button className="mt-8 bg-[#2557A7] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition">
            Browse Jobs
          </button>

        </div>
      </div>

    </div>
  );
};

export default CompanyReviews;