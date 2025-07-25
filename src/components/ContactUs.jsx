"use client";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";
import Link from "next/link";

export default function ContactUs() {
  const pathname = usePathname();
  const Validation = useMemo(() => {
    const hiddenRoutes = [
      "/contact-us",
      "/privacy-policy",
      "/terms-and-conditions",
      "/tournaments",
      "/registration",
      "/book-a-demo",
      "/training",
    ];
    return !hiddenRoutes.includes(pathname);
  }, [pathname]);

  return (
    Validation && (
      <section className="w-full my-20">
        <div className="bg-[#2B3AA0] md:py-16 py-12 px-8 rounded-tl-[60px] rounded-br-[60px] w-11/12 mx-auto flex max-md:flex-col-reverse gap-12">
          <div className="md:w-[50%] w-full flex flex-col gap-4 max-md:mt-24">
            <h2 className="md:text-5xl text-4xl leading-[52px] font-bold md:leading-[60px] text-white">
              Would you like to know more about how it works?
            </h2>
            <Link
              href="/contact-us"
              className="md:mt-6 mt-2 w-fit text-white bg-[#FFB31A] px-8 py-3 rounded-lg transition-all duration-[3000ms] ease-in-out hover:bg-gradient-to-r hover:from-[#fed687] hover:via-[#f3c15d] hover:to-[#FFB31A]"
            >
              Get in touch with us
            </Link>
          </div>

          <div className="relative md:w-[50%] w-full">
            <motion.div
              animate={{
                //   x: [-15, 15, -15],
                y: [-15, 15, -15], // move right
              }}
              transition={{
                duration: 3, // total animation time
                ease: "easeInOut",
                repeat: Infinity, // repeat forever
                repeatDelay: 1, // delay between repeats
              }}
              className="md:w-[90%] w-full p-[4px] group border-4 border-[#FFB31A] inline-block absolute rounded-tl-[40px] rounded-br-[40px] top-[-120px] left-[2%]"
            >
              <img
                src="/images/contact-section.jpeg"
                className="rounded-tl-[35px] group-hover:scale-[105%] transition-all duration-300 rounded-br-[35px]"
              />
            </motion.div>
          </div>
        </div>
      </section>
    )
  );
}
