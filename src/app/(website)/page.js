"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamic imports for better performance
const GoogleReviews = dynamic(() => import("../../components/GoogleReviews"), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
});

export default function Home() {
  const [reviewLocation, setReviewLocation] = useState('jpnagar');

  return (
    <>
      {/* Banner */}
      <section className="section mt-16">
        <div
          className="relative md:py-30 py-14 max-md:pb-20 md:px-20 px-4 bg-cover bg-center md:w-11/12 w-full mx-auto clip-diagonal"
          style={{ backgroundImage: "url('/images/home-banner-two.jpg')" }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black opacity-30 z-0 md:rounded-xl" />

          {/* Content */}
          <div className="relative z-10">
            <h1 className="md:text-5xl text-[40px] capitalize md:leading-[60px] leading-[52px] font-[900] md:mt-8 md:mb-16 mb-12 text-[#FFFFFF]">
              Where young minds
              <br className="max-md:hidden" />
              <span className="max-md:ml-3">learn to think ahead,</span>
              <br className="max-md:hidden" />
              one game at a time
            </h1>
            <Link
              href="/book-a-demo"
              className=" text-white bg-[#2B3AA0] px-10 py-3 rounded-lg transition-all duration-[3000ms] ease-in-out hover:bg-gradient-to-r hover:from-[#7a86d8] hover:via-[#4b57a3] hover:to-[#2B3AA0]"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Intro section */}
      <section className="w-11/12 mx-auto flex md:flex-row-reverse flex-col-reverse  gap-12 mt-20">
        <div className="md:w-[50%] w-full flex flex-col gap-4 max-md:-mt-2">
          <h2 className="text-5xl font-bold text-[#FFB31A] max-md:hidden">
            At ThinQ Chess
          </h2>
          <p className="text-[18px]">
            We believe chess is more than a game—it's a way to shape minds. Our
            courses are designed for children aged 5 years onwards, helping
            build focus, strategy, and confidence from the board to real life.
            Every class, every move, and every tournament is designed to sharpen
            their thinking while keeping the experience fun and engaging.
          </p>
          <p className="text-[18px]">
            We value clear communication with parents, celebrate every
            milestone, and remain committed to guiding each child’s unique
            journey—always cheering them on from the sidelines.
          </p>
        </div>
        <div className="md:w-[50%] w-full">
          <h2 className="text-4xl font-bold text-[#FFB31A] md:hidden mb-8">
            At ThinQ Chess
          </h2>
          <div className="p-1 rounded-tl-[40px] rounded-br-[40px] border-[4px] group border-solid border-black">
            <img
              src="/images/indian-img-one.jpg"
              alt="Chessboard"
              className="w-full h-[300px] group-hover:scale-[105%] transition-all duration-300 object-cover rounded-tl-[40px] rounded-br-[40px] "
            />
          </div>
        </div>
      </section>

      {/* Our Team */}
      {/* <section className="md:w-11/12 w-full mx-auto my-20 mb-40 max-md:px-4">
        <h2 className="text-5xl font-bold text-[#FFB31A] text-center">
          Our Team
        </h2>
        <div className="my-20 mt-10 flex md:flex-row flex-col gap-6">
          {ourTeam.map((item) => {
            return (
              <div
                key={item.name}
                className="w-full h-[400px] relative group overflow-hidden rounded-tl-[50px] rounded-br-[50px]"
              >
                <img src={item.img} />
                <div className="bg-[#00000099] group-hover:top-[0px] transition-all duration-300 pb-[100px] absolute top-[330px] w-full">
                  <h3 className="text-[32px] font-[600] text-white px-5 mt-3">
                    {item.name}
                  </h3>
                  <p className="mt-3 text-[17px] text-white side-scroll px-5 pr-3 mr-4 h-[300px] overflow-y-scroll">
                    {item.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section> */}

      {/* Why Choose Thinq Chess: */}
      <section className="w-full md:py-24 py-14 md:pb-30 md:mt-30 mt-10 bg-gradient-to-r from-[#d4d9f7] via-[#b3baec] to-[#747fb1]">
        <div className="w-11/12 flex max-md:flex-col mx-auto">
          <div className="w-[50%] max-md:w-full">
            <h2 className="md:text-5xl text-4xl font-bold mt-4">
              Why Choose ThinQ Chess
            </h2>
            <div className="md:hidden mt-10 p-[4px] border-4 border-[#FFB31A] inline-block rounded-tr-[100px] rounded-bl-[100px]">
              <img
                src="/images/course-offered.jpg"
                alt="Framed"
                className="w-full rounded-tr-[95px] object-cover rounded-bl-[95px] "
              />
            </div>

            <ul className="mt-8 flex flex-col gap-4">
              {[
                "Structured curriculum with measurable outcomes",
                "Personalized attention through game-based coaching",
                "Transparent tracking of student progress",
                "Tournaments to build confidence",
                "Encouraging and inspiring mentors",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">
                    <img
                      src="/images/check-mark.png"
                      className="max-md:max-w-[20px] w-[20px]"
                    />
                  </span>
                  <span className="text-[20px] text-black font-[400]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-[50%] max-md:hidden relative">
            {/* images */}
            <motion.div
              animate={{
                y: [-15, 15, -15], // move right
              }}
              transition={{
                duration: 3, // total animation time
                ease: "easeInOut",
                repeat: Infinity, // repeat forever
                repeatDelay: 1, // delay between repeats
              }}
            >
              <div className="p-[4px] border-4 border-[#FFB31A] inline-block absolute md:rounded-tr-[100px] rounded-tr-[60px] md:rounded-bl-[100px] rounded-bl-[60px] top-[-160px] left-[0px]">
                <img
                  src="/images/head-coach.jpeg"
                  alt="Framed"
                  className="md:h-[450px] md:w-[280px] w-full h-[200px] md:rounded-tr-[95px] rounded-tr-[55px] object-cover md:rounded-bl-[95px] rounded-bl-[55px]"
                />
              </div>
              <div className="absolute md:bottom-[-375px] md:left-[8%] bottom-[-120px] left-[4%] flex flex-col items-center">
                <p className="text-[24px]  max-md:text-[20px] font-bold ">
                  Krishna Thapa
                </p>
                <p className="text-[16px]">Candidate Master</p>
              </div>
            </motion.div>
            <motion.div
              animate={{
                y: [15, -15, 15], // move right
              }}
              transition={{
                duration: 3, // total animation time
                ease: "easeInOut",
                repeat: Infinity, // repeat forever
                repeatDelay: 1, // delay between repeats
              }}
            >
              <div className="absolute md:top-[-45px] md:right-[17%] top-[-20px] right-[10%] flex flex-col items-center">
                <p className="text-[24px] max-md:text-[20px] font-bold ">
                  Chiranth M
                </p>
                <p className="text-[16px]">FIDE rated player</p>
              </div>
              <div className="p-[4px] border-4 border-[#FFB31A] inline-block absolute  md:rounded-tr-[100px] rounded-tr-[60px] md:rounded-bl-[100px] rounded-bl-[60px] top-[50px] right-[20px]">
                <img
                  src="/images/Chiranth .jpeg"
                  alt="Framed"
                  className="md:h-[450px] md:w-[280px] w-full h-[200px] object-center md:rounded-tr-[95px] rounded-tr-[55px] object-cover md:rounded-bl-[95px] rounded-bl-[55px]"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Highlights: */}
      <section className="w-full md:py-20 py-2 pb-16 mt-10">
        <div className="w-11/12 mx-auto">
          <h2 className="md:text-5xl text-4xl text-center font-bold mt-4 text-[#2B3AA0]">
            Quick Highlights
          </h2>
          <div className="max-md:flex max-md:flex-col md:grid grid-cols-3 grid-rows-2 gap-8 md:mt-14 mt-8">
            <div className="flex flex-col group items-center shadow-md px-4 py-4 rounded-[16px] hover:scale-[102%] transition-all duration-300">
              <img
                src="/images/performance.png"
                className="w-[100px] group-hover:scale-x-[-1] transition-all duration-300"
              />
              <h3 className="md:text-[20px] text-[18px] text-center mt-3">
                Programs from the foundation to the professional level
              </h3>
            </div>

            <div className="flex flex-col items-center group shadow-md px-4 py-4 rounded-[16px] hover:scale-[102%] transition-all duration-300">
              <img
                src="/images/trophy.png"
                className="w-[100px] group-hover:scale-x-[-1] transition-all duration-300"
              />
              <h3 className="md:text-[20px] text-[18px] text-center mt-3">
                Regular
                <br />
                Tournaments
              </h3>
            </div>

            <div className="flex flex-col items-center group shadow-md px-4 py-4 rounded-[16px] hover:scale-[102%] transition-all duration-300">
              <img
                src="/images/progress.png"
                className="w-[100px] group-hover:scale-x-[-1] transition-all duration-300"
              />
              <h3 className="md:text-[20px] text-[18px] text-center mt-3">
                Progress is tracked and shared regularly with parents
              </h3>
            </div>

            <div className="flex flex-col items-center group shadow-md px-4 py-4 rounded-[16px] hover:scale-[102%] transition-all duration-300">
              <img
                src="/images/mentoring.png"
                className="w-[100px] group-hover:scale-x-[-1] transition-all duration-300"
              />
              <h3 className="md:text-[20px] text-[18px] text-center mt-3">
                Classes led by trained, child-friendly trainers
              </h3>
            </div>

            <div className="flex flex-col group items-center shadow-md px-4 py-4 rounded-[16px] hover:scale-[102%] transition-all duration-300">
              <img
                src="/images/log-in.png"
                className="w-[100px] group-hover:scale-x-[-1] transition-all duration-300"
              />
              <h3 className="md:text-[20px] text-[18px] text-center mt-3">
                Flexible schedules
              </h3>
            </div>

            <div className="flex flex-col group items-center shadow-md px-4 py-4 rounded-[16px] hover:scale-[102%] transition-all duration-300">
              <img
                src="/images/online-offline-coach.png"
                className="w-[100px] group-hover:scale-x-[-1] transition-all duration-300"
              />
              <h3 className="md:text-[20px] text-[18px] text-center mt-3">
                Online and Offline Coaching Available
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="w-11/12 mx-auto my-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#2B3AA0] mb-4">
            What Parents Say About Us
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real reviews from real parents who trust ThinQ Chess Academy for their children's chess education
          </p>
        </div>

        {/* Location Selector for Reviews */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setReviewLocation('jpnagar')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                reviewLocation === 'jpnagar'
                  ? 'bg-[#2B3AA0] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#2B3AA0]'
              }`}
            >
              JP Nagar Reviews
            </button>
            <button
              onClick={() => setReviewLocation('akshayanagar')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                reviewLocation === 'akshayanagar'
                  ? 'bg-[#2B3AA0] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#2B3AA0]'
              }`}
            >
              Akshayanagar Reviews
            </button>
          </div>
        </div>

        <GoogleReviews
          location={reviewLocation === 'jpnagar' ? 'JP Nagar' : 'Akshayanagar'}
          placeId={reviewLocation === 'jpnagar' ? 'ChIJ-_jBcPtrrjsRvd658JobDpM' : 'ChIJkTzF3mjGa0YRQbtfSH3hBJ0'}
        />
      </section>
    </>
  );
}
