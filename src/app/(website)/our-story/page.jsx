"use client";

import Banner from "@/components/ui/Banner";

const OurStory = () => {
  const ourTeam = [
    {
      img: "/images/head-coach.jpeg",
      name: "Krishna Thapa",
      content:
        "I began playing chess at 8 and went on to win gold at the 2019 Asian Amateur Championship. With a peak FIDE rating of 2180, I’ve played legends like Harikrishna, Wei Yi, and Dubov. I’ve also scored wins against several Grandmasters and IMs. Since 2008, I’ve coached players across Australia, Thailand, Nepal, and India.",
      isScrollable: false,
    },
    {
      img: "/images/Chiranth.jpg",
      name: "Chiranth M D",
      content:
        "With 18 years in chess, I’ve won 100+ trophies and represented Karnataka at SGFI Nationals. I was Category C Champion at the 2025 Bengaluru International GM Tournament. As a coach for 5 years, I’ve guided students to FIDE ratings and national titles.",
      isScrollable: false,
    },
    {
      img: "/images/third-trainer.png",
      name: "Adarsh Sanklecha",
      content:
        "I started playing chess at the age of eight and began competing professionally by the time I was thirteen, improving mostly through self-study. I secured 2nd place in the U-19 state-level tournaments and have participated in four national events. As the co-founder of Chess City Raipur, I’ve been working to make chess more accessible by organising tournaments and promoting the game among underprivileged children. For me, chess is more than a sport; it’s a way of life that continues to shape how I think, plan, and grow.",
      isScrollable: true,
    },
    {
      img: "/images/janhavi.jpeg",
      name: "Janhavi Soneji",
      content:
        "I’m Janhavi Soneji, a Chartered Accountant who turned a childhood love for chess into a meaningful and successful journey. I started playing at seven and have earned multiple state and national accolades since. I’m a three-time DSO national champion, three-time state champion, and secured 5th place at the U-17 Nationals—proof that with passion and perseverance, dreams do turn into achievements.",
      isScrollable: true,
    },
  ];
  return (
    <>
      <Banner
        heading={"A Story That Begins Before the First Move"}
        image={"/images/about-banner.jpg"}
        link={"/"}
      />

      <section className="w-11/12 mx-auto flex md:flex-row-reverse flex-col-reverse gap-12 mt-14 md:mt-28 mb-10 md:mb-20">
        <div className="md:w-[50%] w-full flex flex-col gap-4">
          <p className="text-[#FFB31A]">Welcome To ThinQ Chess</p>
          <h2 className="text-5xl font-bold text-[#2B3AA0]">Founders' Note</h2>
          <img
            src="/images/Founders.jpg"
            alt="Chessboard"
            className="md:hidden w-full max-h-[300px] mt-5 mb-3 object-cover object-center rounded-br-[60px] "
          />
          <p className="text-[18px]">
            ThinQ Chess began with its founders, who saw more than
            black-and-white squares. They saw a way to help children build
            confidence, resilience, and the ability to think through every
            challenge, on the board and beyond.
          </p>
          <p className="text-[18px]">
            The founders’ vision came from a deep need to do things
            differently—to create a space that wasn’t just about producing
            champions but raising thinkers. Today, we proudly run a growing
            academy where children aren’t just learning chess; they’re learning
            how to believe in themselves.
          </p>

          <p className="text-[18px]">
            Every batch, every parent-teacher call, every game day reminds us
            why we started.
          </p>
        </div>
        <div className="md:w-[50%] max-md:hidden w-full">
          <div className="p-1 border-solid">
            <img
              src="/images/Founders.jpg"
              alt="Chessboard"
              className="w-full max-h-[420px] object-cover object-center rounded-tl-[0px] rounded-br-[120px] "
            />
          </div>
        </div>
      </section>

      <section className="md:w-12/12 w-full mx-auto max-md:px-4">
        <h2 className="text-5xl font-bold text-[#2B3AA0] text-center">
          Our Team
        </h2>
        <div className="md:w-11/12 max-md:hidden my-20 mt-10 md:mx-auto flex md:flex-row flex-col gap-6 ">
          {ourTeam.map((item) => {
            return (
              <div
                key={item.name}
                className="w-full h-[400px] relative group overflow-hidden rounded-tl-[50px] rounded-br-[50px]"
              >
                <img src={item.img} className="object-cover h-full w-full" />
                <div className="bg-[#00000099] group-hover:top-[0px] transition-all duration-300 pb-[100px] absolute top-[330px] w-full">
                  <h3 className="text-[32px] font-[600] text-white px-5 mt-3">
                    {item.name}
                  </h3>
                  <p
                    className={`mt-3 text-[17px] text-white ${
                      item.isScrollable
                        ? "side-scroll overflow-y-scroll h-[280px]"
                        : "h-[300px]"
                    }  px-5 pr-3 mr-4`}
                  >
                    {item.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="md:w-11/12 md:hidden my-20 mt-10 md:mx-auto flex md:flex-row flex-col gap-6">
          {ourTeam.map((item) => {
            return (
              <div key={item.name} className="w-full">
                <img
                  src={item.img}
                  className="object-bottom rounded-tl-[50px] rounded-br-[50px]"
                />
                <div className="pb-[20px] w-full">
                  <h3 className="text-[32px] font-[600] text-[#FFB31A] mt-3">
                    {item.name}
                  </h3>
                  <p className={`mt-3 text-[17px] text-black`}>
                    {item.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default OurStory;
