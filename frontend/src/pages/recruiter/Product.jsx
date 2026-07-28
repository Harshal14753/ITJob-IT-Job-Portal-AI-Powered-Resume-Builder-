import React from "react";
import {
  FaTools,
  FaClipboardCheck,
  FaUsers,
  FaRocket,
  FaUserCheck,
} from "react-icons/fa";

const Product = () => {
  const products = [
    {
      title: "Hiring tools built for small businesses",
      description:
        "Everything you need to attract, manage and hire candidates in one place. Designed specifically for startups and small businesses that need to hire quickly without a dedicated HR team.",
      icon: <FaTools className="text-7xl text-[#2557A7]" />,
      reverse: false,
    },
    {
      title: "Start with a free job post",
      description:
        "Publish your first job for free and instantly reach thousands of active IT professionals searching for opportunities in your region and industry.",
      icon: <FaRocket className="text-7xl text-[#2557A7]" />,
      reverse: true,
    },
    {
      title: "Add screenings to find the right talent",
      description:
        "Reduce manual effort by adding custom screening questions, technical assessments and eligibility checks before scheduling interviews.",
      icon: <FaClipboardCheck className="text-7xl text-[#2557A7]" />,
      reverse: false,
    },
    {
      title: "Start to finish hiring, all in one place",
      description:
        "Manage job posts, candidate communication, interview scheduling and hiring decisions from a single recruiter dashboard.",
      icon: <FaUsers className="text-7xl text-[#2557A7]" />,
      reverse: true,
    },
    {
      title: "Upgrade to reach more quality candidates",
      description:
        "Promote your jobs to increase visibility and attract highly qualified candidates with the exact skills your business requires.",
      icon: <FaRocket className="text-7xl text-[#2557A7]" />,
      reverse: false,
    },
    {
      title: "Get access to matched candidates instantly",
      description:
        "Our intelligent sourcing system recommends candidates whose skills, experience and preferences match your requirements.",
      icon: <FaUserCheck className="text-7xl text-[#2557A7]" />,
      reverse: true,
    },
  ];

  return (
    <div className="bg-white min-h-screen">

      {/* Hero Section */}
      <section className="bg-[#2557A7] text-white py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <h1 className="text-5xl font-bold mb-6">
            Products built for smarter hiring
          </h1>

          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-8">
            Discover tools that help recruiters and small businesses
            attract, screen and hire top IT talent faster.
          </p>

          <button className="mt-10 bg-white text-[#2557A7] px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition">
            Start Hiring Today
          </button>

        </div>
      </section>

      {/* Product Sections */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">

          {products.map((item, index) => (
            <div
              key={index}
              className={`
                grid lg:grid-cols-2 gap-16 items-center py-16
                ${item.reverse ? "lg:[&>*:first-child]:order-2" : ""}
              `}
            >

              {/* Illustration */}
              <div className="flex justify-center">
                <div className="
                  w-80 h-80
                  bg-blue-50
                  rounded-full
                  flex
                  items-center
                  justify-center
                  shadow-sm
                ">
                  {item.icon}
                </div>
              </div>

              {/* Content */}
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  {item.title}
                </h2>

                <p className="text-gray-600 text-lg leading-8 mb-8">
                  {item.description}
                </p>

                <button className="
                  bg-[#2557A7]
                  text-white
                  px-6
                  py-3
                  rounded-lg
                  font-medium
                  hover:bg-blue-800
                  transition
                ">
                  Learn More
                </button>
              </div>

            </div>
          ))}

        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#f8f9fa] py-20">
        <div className="max-w-5xl mx-auto text-center px-6">

          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to simplify hiring?
          </h2>

          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-8">
            Join recruiters and businesses already using IT Job Hunt
            to hire faster, reduce manual work and find better candidates.
          </p>

          <div className="flex justify-center gap-4 mt-10 flex-wrap">
            <button className="
              bg-[#2557A7]
              text-white
              px-8
              py-3
              rounded-lg
              font-medium
              hover:bg-blue-800
              transition
            ">
              Post a Job
            </button>

            <button className="
              border
              border-gray-300
              px-8
              py-3
              rounded-lg
              font-medium
              hover:bg-gray-50
              transition
            ">
              Contact Sales
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Product;