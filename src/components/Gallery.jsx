"use client";
import { usePathname } from "next/navigation";

export default function Gallery(props) {
  const pathname = usePathname();

  return (
    pathname !== "/gallery" && (
      <section className="w-11/12 mx-auto md:mb-10 mb-2">
        {/* Title */}
        {props.title && (
          <h2 className="md:text-5xl text-4xl text-center font-bold text-[#2B3AA0]">
            {props.title}
          </h2>
        )}

        {/* Sub Title */}
        {props.subTitle && (
          <h4 className="text-2xl text-center font-bold text-[#2B3AA0]">
            {props.subTitle}
          </h4>
        )}

        {/* Image Grid */}
        <div className="md:mt-16 mt-8 max-md:flex max-md:flex-col md:grid grid-cols-3 grid-rows-2 gap-4">
          {props.GridItems.map((imgItem, index) => {
            return (
              <div key={index} className="group overflow-hidden rounded-md">
                <img
                  src={imgItem}
                  className="group-hover:scale-[105%] transition-all duration-300"
                />
              </div>
            );
          })}
        </div>
      </section>
    )
  );
}
