import Link from "next/link";
const Banner = (props) => {
  return (
    <>
      <section
        className="w-full relative bg-cover bg-center md:mt-22 mt-20"
        style={{ backgroundImage: `url('${props.image}')` }}
      >
        <div className="absolute inset-0 z-10 bg-black opacity-[0.5]"></div>
        <div className="relative z-20 w-11/12 mx-auto py-14 pb-14">
          <h1 className="md:text-5xl text-4xl leading-[52px] md:w-6/12 capitalize md:leading-[60px] font-[900] md:mt-8 text-[#FFFFFF] mb-12">
            {props.heading}
          </h1>
          {props.subheading && (
            <p className={`text-xl text-white`}>{props.subheading}</p>
          )}
          {/* <Link
            href="/contact-us"
            className="text-white bg-[#2B3AA0] px-10 py-3 rounded-lg transition-all duration-[3000ms] ease-in-out hover:bg-gradient-to-r hover:from-[#7a86d8] hover:via-[#4b57a3] hover:to-[#2B3AA0]"
          >
            {props.buttonText ? props.buttonText : "Book a Demo"}
          </Link> */}
        </div>
      </section>
    </>
  );
};

export default Banner;
