"use client";
import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import PhoneInput from "react-phone-input-2";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import "react-phone-input-2/lib/style.css";
import Banner from "@/components/ui/Banner";
// import TournamentRegistrationHandler from "@/components/TournamentRegistrationHandler"; // Not needed anymore
import TournamentCountdown from "@/components/TournamentCountdown";

import { loadRazorpayScript } from "@/utils/loadRazorpay";

const Tournaments = () => {
  const [succesMessage, setSuccesMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAgeValid, setIsAgeValid] = useState(true);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [tournamentFee, setTournamentFee] = useState(500); // Default fee
  const [discountCode, setDiscountCode] = useState("");
  const [discountData, setDiscountData] = useState(null);
  const [finalAmount, setFinalAmount] = useState(500);
  const [tournamentTypes, setTournamentTypes] = useState([]);
  const [selectedTournamentType, setSelectedTournamentType] = useState("");
  const [emailCouponAvailable, setEmailCouponAvailable] = useState(false);
  const [emailCouponInfo, setEmailCouponInfo] = useState(null);
  const [generatingCoupon, setGeneratingCoupon] = useState(false);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Active tournament state
  const [activeTournament, setActiveTournament] = useState(null);
  const [hasActiveTournament, setHasActiveTournament] = useState(false);
  const [tournamentStatus, setTournamentStatus] = useState('loading');
  const [registrationClosed, setRegistrationClosed] = useState(true);
  const [status, setStatus] = useState(null);
  const [upcomingTournament, setUpcomingTournament] = useState(null);
  const [hasUpcomingTournament, setHasUpcomingTournament] = useState(false);
  const [countdownTarget, setCountdownTarget] = useState(null);

  const Online_Sessions = [
    "District/State Championships",
    "National/International Tournaments",
    "Rated Tournaments",
  ];

  const [formData, setFormData] = useState({
    particpantFirstName: "",
    particpantMiddleName: "",
    particpantLastName: "",
    mail_id: "",
    phone_no: "",
    dob: "",
    gender: "",
    fidaID: "",
    tournament_type: "",
    country: "",
    country_code: "",
    state: "",
    city: "",
    location: "",
  });

  // Fetch tournament settings and page status on component mount
  useEffect(() => {
    loadActiveTournament();
  }, []);

  const loadActiveTournament = async () => {
    try {
      setPageLoading(true);

      // First check if there's an active tournament
      const tournamentResponse = await fetch('/api/tournament/active');
      if (tournamentResponse.ok) {
        const tournamentData = await tournamentResponse.json();

        if (tournamentData.hasActiveTournament) {
          setActiveTournament(tournamentData.tournament);
          setHasActiveTournament(true);
          setTournamentStatus(tournamentData.registrationStatus);

          // Tournament details will be set based on selected category

          // Get tournament categories from active tournament
          let categories = [];
          if (tournamentData.tournament.categories) {
            if (Array.isArray(tournamentData.tournament.categories)) {
              categories = tournamentData.tournament.categories;
            } else if (typeof tournamentData.tournament.categories === 'string') {
              try {
                categories = JSON.parse(tournamentData.tournament.categories);
              } catch (error) {
                console.error('Error parsing tournament categories:', error);
                categories = [];
              }
            }
          }

          console.log('Tournament categories loaded:', categories);

          // If no categories, create default open category
          if (categories.length === 0) {
            categories = [{
              id: 'open',
              name: 'Open Category',
              fee: tournamentData.tournament.fee || 500,
              min_age: '',
              max_age: '',
              slots: 50
            }];
          }

          setTournamentTypes(categories);

          // Set first category as default
          if (categories.length > 0) {
            const firstCategory = categories[0];
            const fee = parseFloat(firstCategory.fee) || 500; // Ensure fee is a number
            setSelectedTournamentType(firstCategory.id);
            setTournamentFee(fee);
            setFinalAmount(fee);
            setFormData((prev) => ({ ...prev, tournament_type: firstCategory.id }));
          }

          // Check if registration is open
          if (tournamentData.isRegistrationOpen) {
            setRegistrationClosed(false);
          } else {
            setRegistrationClosed(true);
            setStatus({
              status: tournamentData.registrationStatus,
              message: tournamentData.statusMessage
            });

            // Set countdown target if registration hasn't started yet
            if (tournamentData.countdownTarget) {
              setCountdownTarget(tournamentData.countdownTarget);
            }
          }
        } else if (tournamentData.hasUpcomingTournament) {
          // Upcoming tournament found
          setHasActiveTournament(false);
          setHasUpcomingTournament(true);
          setUpcomingTournament(tournamentData.upcomingTournament);
          setCountdownTarget(tournamentData.countdownTarget);
          setRegistrationClosed(true);
          setStatus({
            status: 'upcoming_tournament',
            message: tournamentData.statusMessage
          });
        } else {
          // No active or upcoming tournament
          setHasActiveTournament(false);
          setHasUpcomingTournament(false);
          setRegistrationClosed(true);
          setStatus({
            status: 'no_tournaments',
            message: 'No tournaments scheduled at the moment. Please check back later.'
          });
        }
      } else {
        throw new Error('Failed to fetch tournament data');
      }

      setPageLoading(false);
    } catch (error) {
      console.error('Error loading active tournament:', error);
      setHasActiveTournament(false);
      setRegistrationClosed(true);
      setStatus({
        status: 'error',
        message: 'Unable to load tournament information. Please try again later.'
      });
      setPageLoading(false);
    }
  };

  // Check if the user is not older than 16 years
  const isValidAge = (dob) => {
    if (!dob) return false;
    const cutoffDate = new Date("2009-01-01");
    const userDOB = new Date(dob);
    return userDOB >= cutoffDate;
  };

  // Validate discount code
  const validateDiscount = async (code) => {
    if (!code.trim()) {
      setDiscountData(null);
      setFinalAmount(tournamentFee);
      return;
    }

    setIsValidatingDiscount(true);
    try {
      const response = await fetch('/api/tournament/validate-discount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim(),
          amount: tournamentFee
        })
      });

      const result = await response.json();

      if (result.valid) {
        setDiscountData(result);
        setFinalAmount(result.final_amount);
        setErrorMessage("");
      } else {
        setDiscountData(null);
        setFinalAmount(tournamentFee);
        setErrorMessage(result.error || "Invalid discount code");
      }
    } catch (error) {
      console.error('Error validating discount:', error);
      setDiscountData(null);
      setFinalAmount(tournamentFee);
      setErrorMessage("Error validating discount code");
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  // Handle discount code input change
  const handleDiscountChange = (e) => {
    const code = e.target.value.toUpperCase();
    setDiscountCode(code);

    // Debounce validation
    clearTimeout(window.discountTimeout);
    window.discountTimeout = setTimeout(() => {
      validateDiscount(code);
    }, 500);
  };

  // Handle tournament type selection
  const handleTournamentTypeChange = (e) => {
    const typeId = e.target.value;
    setSelectedTournamentType(typeId);
    setFormData((prev) => ({ ...prev, tournament_type: typeId }));

    // Update fee based on selected tournament type
    const selectedType = tournamentTypes.find(type => type.id == typeId); // Use == for loose comparison

    if (selectedType) {
      const fee = parseFloat(selectedType.fee) || 500; // Ensure fee is a number
      setTournamentFee(fee);
      // Recalculate final amount with discount if applied
      if (discountData) {
        const discountAmount = (fee * discountData.discount_percent) / 100;
        setFinalAmount(fee - discountAmount);
      } else {
        setFinalAmount(fee);
      }
    }
  };

  // Check for email-based coupons
  const checkEmailCoupon = async (email) => {
    if (!email || !email.includes('@')) return;

    try {
      const response = await fetch(`/api/generate-coupon?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setEmailCouponAvailable(data.available);
        setEmailCouponInfo(data.coupon_info);
      }
    } catch (error) {
      console.error('Error checking email coupon:', error);
    }
  };

  // Generate email-based coupon
  const generateEmailCoupon = async () => {
    if (!formData.mail_id) return;

    setGeneratingCoupon(true);
    try {
      const response = await fetch('/api/generate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.mail_id })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDiscountCode(data.coupon_code);
          validateDiscount(data.coupon_code);
          setMessage(`🎉 ${data.message} Code: ${data.coupon_code}`);
          setTimeout(() => setMessage(""), 5000);
        }
      }
    } catch (error) {
      console.error('Error generating coupon:', error);
    } finally {
      setGeneratingCoupon(false);
    }
  };

  // Handles changes for standard input fields
  const handleChange = (e) => {
    setErrorMessage("");
    const { name, value } = e.target;

    if (name === "mail_id") {
      // Check for email-based coupons when email changes
      checkEmailCoupon(value);
    }

    if (name === "dob") {
      setIsAgeValid(isValidAge(value));

      // Check age eligibility for selected tournament type
      if (selectedTournamentType && value) {
        const selectedType = tournamentTypes.find(type => type.id == selectedTournamentType); // Use == for loose comparison
        if (selectedType && !isEligibleForTournamentType(value, selectedType)) {
          setErrorMessage(`Age not eligible for ${selectedType.name}. Please select appropriate tournament type.`);
        }
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Check if age is eligible for tournament type
  const isEligibleForTournamentType = (dob, tournamentType) => {
    if (!dob || !tournamentType) return true;
    if (!tournamentType.min_age && !tournamentType.max_age) return true; // Open category

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (tournamentType.min_age && age < parseInt(tournamentType.min_age)) return false;
    if (tournamentType.max_age && age > parseInt(tournamentType.max_age)) return false;

    return true;
  };

  // Handles changes for react-select components
  const handleSelectChange = (name, selectedOption) => {
    setErrorMessage("");
    console.log("name =", name, "and selectedoptions =", selectedOption);
    if (name === "country") {
      setFormData((prev) => ({
        ...prev,
        country: selectedOption ? selectedOption.label : "",
        country_code: selectedOption ? selectedOption.value : "",
        state: "", // Reset state when country changes
        city: "", // Reset city when country changes
      }));
    } else if (name === "state") {
      setFormData((prev) => ({
        ...prev,
        state: selectedOption ? selectedOption.value : "",
        city: "", // Reset city when state changes
      }));
    } else if (name === "city") {
      setFormData((prev) => ({
        ...prev,
        city: selectedOption ? selectedOption.value : "",
      }));
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Basic validation (you can expand this)
    if (!isValidAge(formData.dob)) {
      setErrorMessage(
        "Only students aged 16 or below (born on or after 01-Jan-2009) are eligible to register."
      );
      return;
    }

    if (
      !formData.particpantFirstName ||
      !formData.particpantLastName ||
      !formData.dob ||
      !formData.gender ||
      !formData.country ||
      !formData.state ||
      !formData.city
    ) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccesMessage("");

    // Demo payment - skip Razorpay loading

    try {
      setSuccesMessage("Processing payment...");

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate demo payment ID
      const demoPaymentId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Save registration data directly with completed payment status
      const registrationResponse = await fetch("/api/tournament/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tournament_id: activeTournament?.id || null,
          tournament_type: selectedTournamentType,
          amount_paid: finalAmount,
          discount_code: discountCode,
          discount_amount: discountData ? (tournamentFee - finalAmount) : 0,
          payment_id: demoPaymentId,
          payment_status: 'completed' // Mark as completed
        }),
      });

      const registrationData = await registrationResponse.json();

      if (registrationData.success) {
        console.log("Registration saved successfully:", registrationData.registration);
        setSuccesMessage("Payment successful and registration completed!");
        setPaymentSuccess(true);
        setRegistrationData({
          ...registrationData.registration,
          payment_id: demoPaymentId
        });
      } else {
        console.error("Registration save failed:", registrationData.error);
        setErrorMessage("Registration failed. Please try again.");
      }





    } catch (error) {
      console.error("Payment processing failed:", error);
      setErrorMessage("Payment processing failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (formData.country_code) {
      const stateList = State.getStatesOfCountry(formData.country_code);
      setStates(stateList);
      setCities([]); // Reset cities
    } else {
      setStates([]);
      setCities([]);
    }
  }, [formData.country_code]);

  useEffect(() => {
    if (formData.country_code && formData.state) {
      const cityList = City.getCitiesOfState(
        formData.country_code,
        formData.state
      );
      setCities(cityList);
    } else {
      setCities([]);
    }
  }, [formData.state, formData.country_code]);

  // Page Loading Screen
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#2B3AA0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="w-12 h-12 border-4 border-[#FFB31A] border-t-transparent rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <h3 className="text-lg font-semibold text-[#2B3AA0] mb-2">ThinQ Chess Academy</h3>
          <p className="text-gray-600">Loading tournament page...</p>
        </div>
      </div>
    );
  }

  // Payment Success Screen
  if (paymentSuccess && registrationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl">✓</span>
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">Your tournament registration has been confirmed.</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-bold text-gray-800 mb-4">Registration Details:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><strong>Name:</strong> {formData.particpantFirstName} {formData.particpantLastName}</div>
              <div><strong>Email:</strong> {formData.mail_id}</div>
              <div><strong>Phone:</strong> {formData.phone_no}</div>
              <div><strong>Amount Paid:</strong> ₹{finalAmount}</div>
              {registrationData.payment_id && (
                <div><strong>Payment ID:</strong> {registrationData.payment_id}</div>
              )}
              <div><strong>Registration Date:</strong> {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              A confirmation email has been sent to your registered email address.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setPaymentSuccess(false);
                  setPaymentStep(false);
                  setRegistrationData(null);
                }}
                className="bg-[#2B3AA0] hover:bg-[#1e2a70] text-white px-6 py-3 rounded-lg transition-colors"
              >
                Register Another Participant
              </button>
              <a
                href="/"
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Banner
        heading={"Where young minds test their mettle"}
        image={"/images/about-banner.jpg"}
        link={"/"}
        linkText={"Home"}
      />

            <section className="w-11/12 mx-auto flex md:flex-row flex-col gap-12 md:mt-28 mt-14 mb-12 md:mb-20">
        <div className="md:w-[50%] w-full flex flex-col gap-4">
          <h2 className="md:text-5xl text-4xl leading-[52px] font-bold text-[#2B3AA0] md:leading-[60px]">
            ThinQ Chess Tournaments
          </h2>
          <p className="text-[18px] mt-2">
            We host friendly, competitive regular tournaments at our center,
            designed to help children experience the joy of competition and
            learn how to handle both wins and losses with grace.
          </p>
          <p className="text-[18px]">
            Our periodical tournaments give our students the required practice
            and exposure to participate in:
          </p>

          {/* List */}
          <div className="flex flex-col gap-2">
            {Online_Sessions.map((session, index) => {
              return (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex item-center w-fit">
                    <span
                      className="material-symbols-outlined text-[#FFB31A]"
                      style={{ fontSize: "24px", fontWeight: "600" }}
                    >
                      check
                    </span>
                  </div>
                  <p className="text-[18px]">{session}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="md:w-[50%] max-md:hidden w-full">
          <div className="p-1">
            <img
              src="/images/chess-tournament.webp"
              alt="Chessboard"
              className="w-full min-h-[420px] object-cover object-center rounded-tl-[0px] rounded-br-[120px] "
            />
          </div>
        </div>
      </section>

      <section className="w-11/12 flex md:flex-row flex-col md:gap-16 gap-10 mx-auto my-10 md:my-28">
        {/* Show image if there's an active tournament or upcoming tournament */}
        {(activeTournament || upcomingTournament) && (
          <div className="md:w-[50%] w-full">
            <img
              src={(activeTournament?.flyer_image || upcomingTournament?.flyer_image) || "/images/tournament.jpg"}
              alt={`${(activeTournament?.name || upcomingTournament?.name)} Tournament Flyer`}
              className="w-full rounded-lg aspect-square object-contain bg-gray-50 p-4"
            />
            {/* Registration Status Overlay for Upcoming Tournament - REMOVED */}
          </div>
        )}
        <div className={(activeTournament || upcomingTournament) ? "md:w-[50%] w-full" : "w-full"}>
          <h2 className="md:mt-0 mt-2 md:text-5xl text-4xl leading-[52px] font-bold text-[#2B3AA0] md:leading-[60px]">
            Tournament Registration
          </h2>

          {/* Tournament Status Messages */}
          {status && (
            <div className={`mt-4 p-4 rounded-lg border ${
              status.status === 'no_tournaments' ? 'bg-gray-100 border-gray-300 text-gray-700' :
              status.status === 'upcoming_tournament' ? 'bg-blue-100 border-blue-300 text-blue-700' :
              status.status === 'tournament_ended' ? 'bg-red-100 border-red-300 text-red-700' :
              status.status === 'tournament_in_progress' ? 'bg-yellow-100 border-yellow-300 text-yellow-700' :
              status.status === 'closed' ? 'bg-orange-100 border-orange-300 text-orange-700' :
              'bg-green-100 border-green-300 text-green-700'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {status.status === 'no_tournaments' ? '' :
                   status.status === 'upcoming_tournament' ? '⏰' :
                   status.status === 'tournament_ended' ? '🏁' :
                   status.status === 'tournament_in_progress' ? '🎯' :
                   status.status === 'closed' ? '🔒' : '✅'}
                </span>
                {/* Hide status message for no_tournaments to avoid duplicate */}
                {status.status !== 'no_tournaments' && (
                  <p className="font-medium">{status.message}</p>
                )}
              </div>

              {/* Countdown for upcoming tournament */}
              {status.status === 'upcoming_tournament' && countdownTarget && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-blue-800 mb-2">⏰ Registration starts in:</p>
                  <TournamentCountdown
                    targetDate={countdownTarget}
                    onComplete={() => {
                      // Refresh tournament status when countdown completes
                      loadActiveTournament();
                    }}
                  />
                </div>
              )}
            </div>
          )}




          <div className="md:mt-6 mt-6">
            {registrationClosed === true ? (
              // Different states based on tournament status
              <div>
                {/* No Tournaments Available */}
                {status?.status === 'no_tournaments' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <div className="text-5xl mb-4">🏆</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Tournaments are closed now</h3>
                    <p className="text-gray-700 mb-8">Please check back later for upcoming tournaments.</p>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-4 text-lg">📞 Need Help?</h4>
                      <div className="text-gray-700 space-y-2">
                        <p className="text-base">📧 Email: admin@thinqchess.com</p>
                        <p className="text-base">📱 Phone: +91 7975820187</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upcoming Tournament with Countdown */}
                {status?.status === 'upcoming' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-4">⏰</div>
                    <h3 className="text-xl font-bold text-blue-800 mb-3">Registration Opening Soon!</h3>
                    <p className="text-blue-700 mb-4">{status.message}</p>

                    {status.countdownTarget && (
                      <div className="mt-6">
                        <TournamentCountdown
                          targetDate={status.countdownTarget}
                          message="Registration opens in:"
                        />
                      </div>
                    )}

                    {status.nextTournament && (
                      <div className="mt-6 p-4 bg-white rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Next Tournament:</h4>
                        <p className="text-blue-700 font-medium">{status.nextTournament.name}</p>
                        <p className="text-blue-600 text-sm">{status.nextTournament.description}</p>
                      </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">📞 Need Help?</h4>
                      <div className="text-sm text-blue-700">
                        <p>📧 Email: admin@thinqchess.com</p>
                        <p>📱 Phone: +91 7975820187</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Registration Closed (Tournament Running) */}
                {status?.status === 'registration_closed' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-4">🏃‍♂️</div>
                    <h3 className="text-xl font-bold text-yellow-800 mb-3">Tournament in Progress</h3>
                    <p className="text-yellow-700 mb-4">{status.message}</p>

                    <div className="mt-6 pt-4 border-t border-yellow-200">
                      <h4 className="font-semibold text-yellow-800 mb-2">📞 Need Help?</h4>
                      <div className="text-sm text-yellow-700">
                        <p>📧 Email: admin@thinqchess.com</p>
                        <p>📱 Phone: +91 7975820187</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {status?.status === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="text-xl font-bold text-red-800 mb-3">Unable to Load Tournament Status</h3>
                    <p className="text-red-700 mb-4">{status.message}</p>

                    <button
                      onClick={() => window.location.reload()}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Registration Form
              <>
                <script src="https://checkout.razorpay.com/v1/checkout.js" />
                <form onSubmit={handlePayment}>
              {/* Participant Name */}
              <h2 className="text-[18px] mb-2">Participant Name:</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  name="particpantFirstName"
                  placeholder="First Name *"
                  value={formData.particpantFirstName}
                  onChange={handleChange}
                  required
                  className="p-1 border border-[#d3d1d1] rounded"
                />
                <input
                  name="particpantMiddleName"
                  placeholder="Middle Name (Optional)"
                  value={formData.particpantMiddleName}
                  onChange={handleChange}
                  className="p-1 border border-[#d3d1d1] rounded"
                />
                <input
                  name="particpantLastName"
                  placeholder="Last Name *"
                  value={formData.particpantLastName}
                  onChange={handleChange}
                  required
                  className="p-1 border border-[#d3d1d1] rounded"
                />
              </div>

              {/* MailId and Phone number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                <div className="w-full">
                  <h2 className="text-[18px] mb-2">Mail ID:</h2>
                  <input
                    name="mail_id"
                    type="email"
                    placeholder="Mail ID *"
                    value={formData.mail_id}
                    onChange={handleChange}
                    required
                    className="p-1 w-full border border-[#d3d1d1] rounded"
                  />
                </div>
                <div className="w-full">
                  <h2 className="text-[18px] mb-2">Phone no:</h2>
                  <PhoneInput
                    country={"in"} // default country
                    inputStyle={{ width: "100%", height: "34px" }}
                    enableSearch={true}
                    inputProps={{
                      name: "phone_no",
                      required: true,
                    }}
                    value={formData.phone_no} // Control value directly
                    onChange={(value, countryData, e, formattedValue) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone_no: formattedValue,
                      }))
                    }
                  />
                </div>
              </div>



              {/* Date of Birth */}
              <div className="flex md:flex-row flex-col gap-4 md:items-center mt-5">
                <h2 className="text-[18px]">Date of Birth:</h2>
                <div>
                  <input
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                    className="w-full p-1 border border-[#d3d1d1] rounded"
                  />
                </div>
              </div>

              {!isAgeValid && (
                <p className="text-red-600 mt-2 text-sm">
                  Only students aged 16 or below (born on or after 01-Jan-2009)
                  are eligible.
                </p>
              )}

              {/* Gender */}
              <div className="flex md:flex-row flex-col gap-4 md:items-center mt-5">
                <h2 className="text-[18px]">Gender:</h2>
                <div className="flex gap-4">
                  {["Male", "Female", "Other"].map((g) => (
                    <label key={g} className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={formData.gender === g}
                        onChange={handleChange}
                        required
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </div>

              {/* FIDE ID */}
              <div className="flex md:flex-row flex-col gap-4 md:items-center mt-5">
                <h2 className="text-[18px]">FIDE ID (if any):</h2>
                <input
                  name="fidaID"
                  placeholder="FIDE ID"
                  value={formData.fidaID}
                  onChange={handleChange}
                  className="p-1 border border-[#d3d1d1] rounded"
                />
              </div>

              {/* Country and State */}
              <div className="flex md:flex-row flex-col md:gap-6">
                {/* Country */}
                <div className="flex md:flex-row flex-col gap-4 md:items-center mt-5">
                  <h2 className="text-[18px]">Country:</h2>
                  <Select
                    options={Country.getAllCountries().map((c) => ({
                      label: c.name,
                      value: c.isoCode,
                      phonecode: c.phonecode, // Not used, but kept for context
                    }))}
                    className="md:w-[200px] w-full"
                    placeholder="Select a country *"
                    value={
                      formData.country_code
                        ? {
                            label: formData.country,
                            value: formData.country_code,
                          }
                        : null
                    }
                    onChange={(selectedOption) =>
                      handleSelectChange("country", selectedOption)
                    }
                    required
                  />
                </div>

                {/* State */}
                <div className="flex md:flex-row flex-col gap-4 md:items-center mt-5">
                  <h2 className="text-[18px]">State:</h2>
                  <Select
                    options={states.map((s) => ({
                      label: s.name,
                      value: s.isoCode,
                    }))}
                    placeholder="Select a state *"
                    className="md:w-[200px] w-full"
                    value={
                      formData.state
                        ? {
                            label:
                              states.find((s) => s.isoCode === formData.state)
                                ?.name || formData.state,
                            value: formData.state,
                          }
                        : null
                    }
                    onChange={(selectedOption) =>
                      handleSelectChange("state", selectedOption)
                    }
                    isDisabled={!formData.country_code} // Disable if no country selected
                    required
                  />
                </div>
              </div>

              {/* City and Location */}
              <div className="flex md:flex-row flex-col md:gap-6 ">
                {/* City */}
                <div className="flex md:flex-row flex-col gap-4 md:items-center mt-5">
                  <h2 className="text-[18px]">City:</h2>
                  <Select
                    options={cities.map((c) => ({
                      label: c.name,
                      value: c.name,
                    }))}
                    placeholder="Select a city *"
                    className="md:w-[200px] w-full"
                    value={
                      formData.city
                        ? { label: formData.city, value: formData.city }
                        : null
                    }
                    onChange={(selectedOption) =>
                      handleSelectChange("city", selectedOption)
                    }
                    isDisabled={!formData.state} // Disable if no state selected
                    required
                  />
                </div>

                {/* Location */}
                <div className="flex md:flex-row flex-col gap-4 md:items-center mt-5">
                  <h2 className="text-[18px]">Address:</h2>
                  <input
                    name="location"
                    placeholder="Address"
                    value={formData.location}
                    onChange={handleChange}
                    className="p-1 border border-[#d3d1d1] rounded"
                  />
                </div>
              </div>

              {/* Tournament Category Selection */}
              <div className="flex md:flex-row flex-col gap-4 md:items-center mt-5">
                <h2 className="text-[18px]">Tournament Category:</h2>
                <div className="md:w-[300px] w-full">
                  <select
                    name="tournament_type"
                    value={selectedTournamentType}
                    onChange={handleTournamentTypeChange}
                    required
                    className="w-full p-2 border border-[#d3d1d1] rounded focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                  >
                    <option value="">Select Tournament Category</option>
                    {tournamentTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} - ₹{type.fee}
                        {type.min_age || type.max_age ?
                          ` (Age: ${type.min_age || 'Any'}-${type.max_age || 'Any'})` :
                          ''
                        }
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Discount Code Section */}
              <div className="mt-6">
                <div className="flex md:flex-row flex-col gap-4 md:items-center">
                  <h2 className="text-[18px]">Discount Code:</h2>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={handleDiscountChange}
                      placeholder="Enter discount code (optional)"
                      className="w-full p-2 border border-[#d3d1d1] rounded focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                    />
                    {isValidatingDiscount && (
                      <p className="text-blue-600 text-sm mt-1">Validating discount code...</p>
                    )}
                    {discountData && (
                      <p className="text-green-600 text-sm mt-1">
                        ✅ {discountData.discount_percent}% discount applied!
                        Saved ₹{(tournamentFee - finalAmount).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tournament Fee:</span>
                    <span>₹{tournamentFee}</span>
                  </div>
                  {discountData && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discountData.discount_percent}%):</span>
                      <span>-₹{(tournamentFee - finalAmount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total Amount:</span>
                    <span>₹{finalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="mt-8">
                <button
                  type="submit"
                  className={`bg-[#FFB31A] text-[18px] text-white py-2 px-6 rounded ${
                    isSubmitting || !isAgeValid
                      ? "cursor-not-allowed opacity-70"
                      : "cursor-pointer"
                  }`}
                  disabled={isSubmitting || !isAgeValid} // Disable during submission
                >
                  {/* {isSubmitting ? "Paying..." : "Pay Now"} */}
                  Pay Now
                </button>
              </div>
                </form>
                {succesMessage && (
                  <p className="text-green-600 text-[20px] font-[500]">
                    {succesMessage}
                  </p>
                )}
                {errorMessage && (
                  <p className="text-red-800 text-[20px] font-[500]">
                    {errorMessage}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Tournaments;
