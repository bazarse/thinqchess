"use client";
import { Carousel } from "antd";
import { usePathname } from "next/navigation";
import { LeftCircleOutlined, RightCircleOutlined } from "@ant-design/icons";
import React, { useRef } from "react";

const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <div
      onClick={onClick}
      className="cursor-pointer absolute top-1/2 md:left-[-10px] left-[-20px] transform -translate-y-1/2 z-10 bg-black/30 text-white rounded-full w-10 h-10 flex items-center justify-center"
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
      className="cursor-pointer absolute top-1/2 md:right-[-10px] right-[-20px] transform -translate-y-1/2 z-10 bg-black/30 text-white rounded-full w-10 h-10 flex items-center justify-center"
    >
      <RightCircleOutlined />
    </div>
  );
};

export default function Testimonials() {
  const carouselRef = useRef(null);
  const pathname = usePathname();

  return (
    pathname !== "/testimonials" && (
      <section className="w-11/12 mx-auto pb-16 overflow-visible relative">
        <h2 className="md:text-5xl text-4xl text-center font-bold md:mt-4 text-[#2B3AA0]">
          Testimonials
        </h2>

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
              <div className="flex flex-col items-center md:gap-10 gap-4 md:my-4 py-4 md:px-24 px-6">
                {/* Ratings */}
                <div className=" w-fit flex items-center justify-center gap-2">
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                </div>

                {/* Review Content */}
                <p className="text-center md:text-[24px] text-[16px] font-[500]">
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
                    className="md:w-[80px] md:h-[80px] w-[60px] h-[60px] object-cover rounded-[50%] border-[#FFB31A] border-[3px] border-solid p-1"
                  />
                  <div>
                    <p className="md:text-[20px] text-[18px] font-[700] text-[#2B3AA0]">
                      Mr/Mrs. Client One
                    </p>
                    <p className="text-[16px]">CEO @Google</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex justify-center">
              <div className="flex flex-col items-center md:gap-10 gap-4 md:my-4 py-4 md:px-24 px-6">
                {/* Ratings */}
                <div className=" w-fit flex items-center justify-center gap-2">
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                </div>

                {/* Review Content */}
                <p className="text-center md:text-[24px] text-[16px] font-[500]">
                  "Client Two ----- Lorem Ipsum is simply dummy text of the
                  printing and typesetting industry. Lorem Ipsum has been the
                  industry's standard dummy text ever since the 1500s, when an
                  unknown printer took a galley of type and scrambled it to make
                  a type specimen book.
                </p>

                {/* User or client info */}
                <div className="flex items-center gap-3">
                  <img
                    src="/images/contact-one.jpg"
                    className="md:w-[80px] md:h-[80px] w-[60px] h-[60px] object-cover rounded-[50%] border-[#FFB31A] border-[3px] border-solid p-1"
                  />
                  <div>
                    <p className="md:text-[20px] text-[18px] font-[700] text-[#2B3AA0]">
                      Mr/Mrs. Client Two
                    </p>
                    <p className="text-[16px]">CEO @Google</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex justify-center">
              <div className="flex flex-col items-center md:gap-10 gap-4 md:my-4 py-4 md:px-24 px-6">
                {/* Ratings */}
                <div className=" w-fit flex items-center justify-center gap-2">
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                  <img src="/images/star.png" className=" w-[20px]" />
                </div>

                {/* Review Content */}
                <p className="text-center md:text-[24px] text-[16px] font-[500]">
                  "Client Three ----- Lorem Ipsum is simply dummy text of the
                  printing and typesetting industry. Lorem Ipsum has been the
                  industry's standard dummy text ever since the 1500s, when an
                  unknown printer took a galley of type and scrambled it to make
                  a type specimen book.
                </p>

                {/* User or client info */}
                <div className="flex items-center gap-3">
                  <img
                    src="/images/contact-one.jpg"
                    className="md:w-[80px] md:h-[80px] w-[60px] h-[60px] object-cover rounded-[50%] border-[#FFB31A] border-[3px] border-solid p-1"
                  />
                  <div>
                    <p className="md:text-[20px] text-[18px] font-[700] text-[#2B3AA0]">
                      Mr/Mrs. Client Three
                    </p>
                    <p className="text-[16px]">CEO @Google</p>
                  </div>
                </div>
              </div>
            </div>
          </Carousel>
        </div>
      </section>
    )
  );
}
