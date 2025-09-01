"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useParams } from "next/navigation";
import Banner from "@/components/ui/Banner";

const TournamentDetails = () => {
  const params = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchTournament();
    }
  }, [params.id]);

  const fetchTournament = async () => {
    try {
      const response = await fetch(`/api/tournament/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setTournament(data.tournament);
      } else {
        setError("Tournament not found");
      }
    } catch (error) {
      console.error("Error fetching tournament:", error);
      setError("Failed to load tournament details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B3AA0] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tournament details...</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <>
        <Head>
          <title>Tournament Not Found | ThinQ Chess Academy</title>
          <meta name="description" content="Tournament not found or no longer available." />
          <meta property="og:title" content="Tournament Not Found | ThinQ Chess Academy" />
          <meta property="og:description" content="Tournament not found or no longer available." />
          <meta property="og:image" content="https://www.thinqchess.com/images/chessqueen.png" />
          <meta property="og:url" content={`https://www.thinqchess.com/tournaments/${params.id}`} />
          <meta property="og:type" content="website" />
        </Head>
        <Banner
          heading="Tournament Not Found"
          image="/images/about-banner.jpg"
          link="/"
          linkText="Home"
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Tournament Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <a
              href="/tournaments"
              className="bg-[#2B3AA0] hover:bg-[#1e2a70] text-white px-6 py-3 rounded-lg transition-colors"
            >
              View All Tournaments
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{tournament.name} | ThinQ Chess Academy</title>
        <meta name="description" content={`Register for ${tournament.name} at ThinQ Chess Academy. ${tournament.description || 'Exciting chess tournament with multiple categories.'}`} />
        <meta property="og:title" content={`${tournament.name} | ThinQ Chess Academy`} />
        <meta property="og:description" content={`Register for ${tournament.name} at ThinQ Chess Academy. ${tournament.description || 'Exciting chess tournament with multiple categories.'}`} />
        <meta property="og:image" content={tournament.flyer_image || "https://www.thinqchess.com/images/chessqueen.png"} />
        <meta property="og:url" content={`https://www.thinqchess.com/tournaments/${params.id}`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${tournament.name} | ThinQ Chess Academy`} />
        <meta name="twitter:description" content={`Register for ${tournament.name} at ThinQ Chess Academy.`} />
        <meta name="twitter:image" content={tournament.flyer_image || "https://www.thinqchess.com/images/chessqueen.png"} />
        <link rel="canonical" href={`https://www.thinqchess.com/tournaments/${params.id}`} />
      </Head>

      <Banner
        heading={tournament.name}
        image="/images/about-banner.jpg"
        link="/tournaments"
        linkText="Tournaments"
      />

      <section className="w-11/12 mx-auto flex md:flex-row flex-col gap-12 md:mt-28 mt-14 mb-12 md:mb-20">
        {tournament.flyer_image && (
          <div className="md:w-[50%] w-full">
            <img
              src={tournament.flyer_image}
              alt={`${tournament.name} Tournament Flyer`}
              className="w-full rounded-lg aspect-square object-contain bg-gray-50 p-4"
            />
          </div>
        )}
        
        <div className={tournament.flyer_image ? "md:w-[50%] w-full" : "w-full"}>
          <h1 className="md:text-5xl text-4xl leading-[52px] font-bold text-[#2B3AA0] md:leading-[60px] mb-6">
            {tournament.name}
          </h1>
          
          {tournament.description && (
            <p className="text-[18px] mb-6">{tournament.description}</p>
          )}

          <div className="space-y-4 mb-8">
            {tournament.start_date && (
              <div className="flex items-center gap-3">
                <span className="text-[#FFB31A] text-xl">📅</span>
                <div>
                  <span className="font-semibold">Tournament Date:</span>
                  <span className="ml-2">{new Date(tournament.start_date).toLocaleDateString()}</span>
                </div>
              </div>
            )}

            {tournament.registration_start_date && tournament.registration_end_date && (
              <div className="flex items-center gap-3">
                <span className="text-[#FFB31A] text-xl">📝</span>
                <div>
                  <span className="font-semibold">Registration Period:</span>
                  <span className="ml-2">
                    {new Date(tournament.registration_start_date).toLocaleDateString()} - {new Date(tournament.registration_end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            {tournament.categories && (
              <div className="flex items-start gap-3">
                <span className="text-[#FFB31A] text-xl">🏆</span>
                <div>
                  <span className="font-semibold">Categories:</span>
                  <div className="ml-2 mt-2">
                    {(() => {
                      try {
                        const categories = JSON.parse(tournament.categories);
                        return categories.map((category, index) => (
                          <div key={index} className="bg-gray-100 rounded-lg p-3 mb-2">
                            <div className="font-medium text-[#2B3AA0]">{category.name}</div>
                            <div className="text-sm text-gray-600">
                              Fee: ₹{category.fee}
                              {(category.min_age || category.max_age) && (
                                <span className="ml-3">
                                  Age: {category.min_age || 'Any'} - {category.max_age || 'Any'}
                                </span>
                              )}
                              <span className="ml-3">Slots: {category.slots}</span>
                            </div>
                          </div>
                        ));
                      } catch (e) {
                        return <span className="ml-2">Open Category - ₹500</span>;
                      }
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <a
              href="/tournaments"
              className="bg-[#2B3AA0] hover:bg-[#1e2a70] text-white px-6 py-3 rounded-lg transition-colors text-center"
            >
              Register Now
            </a>
            <a
              href="/contact-us"
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors text-center"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default TournamentDetails;