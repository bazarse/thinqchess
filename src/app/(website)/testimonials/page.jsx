"use client";
import { Carousel } from "antd";
import { LeftCircleOutlined, RightCircleOutlined } from "@ant-design/icons";
import React, { useRef } from "react";
import Testimonials from "@/components/Testimonials";
import Banner from "@/components/ui/Banner";

const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <div
      onClick={onClick}
      className="cursor-pointer absolute top-1/2 left-[-10px] transform -translate-y-1/2 z-10 bg-black/30 text-white rounded-full w-10 h-10 flex items-center justify-center"
    >
      <LeftCircleOutlined />
    </div>
  );
};

const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <div
      onClick={onClick}
      className="cursor-pointer absolute top-1/2 right-[-10px] transform -translate-y-1/2 z-10 bg-black/30 text-white rounded-full w-10 h-10 flex items-center justify-center"
    >
      <RightCircleOutlined />
    </div>
  );
};

const TestimonialsPage = () => {
  const carouselRef = useRef(null);
  return (
    <>
      <Banner
        heading={"What parents and students say"}
        image={"/images/about-banner.jpg"}
        link={"/"}
      />

      <section className="w-11/12 mx-auto my-24 mb-16">
        <h4 className="text-2xl text-center font-bold text-[#2B3AA0]">
          From practice sessions to tournaments, from first wins to lifelong
          friendships
          <br />
          here’s a look into the world of Thin@ Chess.
        </h4>

        <div className="relative overflow-visible mt-8 px-5">
          <Carousel
            prevArrow={
              <PrevArrow onClick={() => carouselRef.current?.prev()} />
            }
            nextArrow={
              <NextArrow onClick={() => carouselRef.current?.next()} />
            }
            arrows
          >
            <div className="w-full flex justify-center">
              <div className="flex flex-col items-center gap-10 my-4 py-4 px-24">
                {/* Ratings */}
                <div className=" w-fit flex items-center justify-center gap-2">
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                </div>

                {/* Review Content */}
                <p className="text-center text-[24px] font-[500]">
                  "Client one ----- Lorem Ipsum is simply dummy text of the
                  printing and typesetting industry. Lorem Ipsum has been the
                  industry's standard dummy text ever since the 1500s, when an
                  unknown printer took a galley of type and scrambled it to make
                  a type specimen book.
                </p>

                {/* User or client info */}
                <div className="flex items-center gap-3">
                  <img
                    src="/images/contact-one.jpg"
                    className="w-[80px] h-[80px] object-cover rounded-[50%] border-[#FFB31A] border-[3px] border-solid p-1"
                  />
                  <div>
                    <p className="text-[20px] font-[700] text-[#2B3AA0]">
                      Mr/Mrs. Client One
                    </p>
                    <p className="text-[16px]">CEO @Google</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex justify-center">
              <div className="flex flex-col items-center gap-10 my-4 py-4 px-24">
                {/* Ratings */}
                <div className=" w-fit flex items-center justify-center gap-2">
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                </div>

                {/* Review Content */}
                <p className="text-center text-[24px] font-[500]">
                  "Client two ----- Lorem Ipsum is simply dummy text of the
                  printing and typesetting industry. Lorem Ipsum has been the
                  industry's standard dummy text ever since the 1500s, when an
                  unknown printer took a galley of type and scrambled it to make
                  a type specimen book.
                </p>

                {/* User or client info */}
                <div className="flex items-center gap-3">
                  <img
                    src="/images/contact-one.jpg"
                    className="w-[80px] h-[80px] object-cover rounded-[50%] border-[#FFB31A] border-[3px] border-solid p-1"
                  />
                  <div>
                    <p className="text-[20px] font-[700] text-[#2B3AA0]">
                      Mr/Mrs. Client two
                    </p>
                    <p className="text-[16px]">CEO @Google</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex justify-center">
              <div className="flex flex-col items-center gap-10 my-4 py-4 px-24">
                {/* Ratings */}
                <div className=" w-fit flex items-center justify-center gap-2">
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                </div>

                {/* Review Content */}
                <p className="text-center text-[24px] font-[500]">
                  "Client three ----- Lorem Ipsum is simply dummy text of the
                  printing and typesetting industry. Lorem Ipsum has been the
                  industry's standard dummy text ever since the 1500s, when an
                  unknown printer took a galley of type and scrambled it to make
                  a type specimen book.
                </p>

                {/* User or client info */}
                <div className="flex items-center gap-3">
                  <img
                    src="/images/contact-one.jpg"
                    className="w-[80px] h-[80px] object-cover rounded-[50%] border-[#FFB31A] border-[3px] border-solid p-1"
                  />
                  <div>
                    <p className="text-[20px] font-[700] text-[#2B3AA0]">
                      Mr/Mrs. Client three
                    </p>
                    <p className="text-[16px]">CEO @Google</p>
                  </div>
                </div>
              </div>
            </div>
          </Carousel>
        </div>
      </section>
    </>
  );
};

export default TestimonialsPage;
