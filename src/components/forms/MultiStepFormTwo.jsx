"use client";
import React, { useState, useRef, useEffect } from "react";
import emailjs from "@emailjs/browser";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import ReCAPTCHA from "react-google-recaptcha";

const MultiStepFormTwo = () => {
  const recaptchaRef = useRef(null);
  const [classesfor, setClassesFor] = useState("Child");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  // Define centres by city
  const centersByCity = {
    "Bangalore": ["JP Nagar, 8th Phase", "Akshayanagar"],
    "Bengaluru": ["JP Nagar, 8th Phase", "Akshayanagar"],
    // Add more cities and their centres here as needed
  };

  // Get available centres based on selected coaching city
  const getAvailableCentres = () => {
    const selectedCity = formData.coaching_city;
    return centersByCity[selectedCity] || [];
  };
  const [step, setStep] = useState(1);
  const [succesMessage, setSuccesMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [enteredCaptcha, setEnteredCaptcha] = useState("");
  const [isHuman, setIsHuman] = useState(false);
  const [tc1, setTc1] = useState(false);
  const [tc2, setTc2] = useState(false);

  const [formData, setFormData] = useState({
    studentFirstName: "",
    studentMiddleName: "",
    studentLastName: "",
    dob: "",
    gender: "",
    studentEmail: "",
    studentPhone: "",

    fatherFirstName: "",
    fatherMiddleName: "",
    fatherLastName: "",
    fatherEmail: "",
    fatherPhone: "",
    motherFirstName: "",
    motherMiddleName: "",
    motherLastName: "",
    motherEmail: "",
    motherPhone: "",

    country: "",
    country_code: "",
    address_line1: "",
    address_line2: "",
    state: "",
    city: "",
    pincode: "",

    mode: "",
    coaching_city: "",
    preferredCentre: "",

    heardFrom: "",
    refFirstName: "",
    refLastName: "",
    otherSource: "",

    Terms_and_condition_one: "No", // Default to No, set to Yes when checked
    Terms_and_condition_two: "No", // Default to No, set to Yes when checked
  });

  // Handles changes for standard input fields with real-time validation
  const handleChange = (e) => {
    setErrorMessage("");
    const { name, value } = e.target;

    // Real-time validation with specific messages
    // Name validation (only letters and spaces)
    if (name.includes('Name') || name.includes('FirstName') || name.includes('LastName')) {
      const nameRegex = /^[a-zA-Z\s]*$/;
      if (!nameRegex.test(value)) {
        if (name.includes('student') || name.includes('Student')) {
          setErrorMessage("Student name should only contain letters and spaces");
        } else if (name.includes('father') || name.includes('Father')) {
          setErrorMessage("Father's name should only contain letters and spaces");
        } else if (name.includes('mother') || name.includes('Mother')) {
          setErrorMessage("Mother's name should only contain letters and spaces");
        } else if (name.includes('ref') || name.includes('Ref')) {
          setErrorMessage("Referral name should only contain letters and spaces");
        } else {
          setErrorMessage("Name should only contain letters and spaces");
        }
        return;
      }
    }

    // Pincode validation (only numbers)
    if (name === 'pincode') {
      const pincodeRegex = /^\d*$/;
      if (!pincodeRegex.test(value)) {
        setErrorMessage("Pincode should only contain numbers");
        return;
      }
      if (value.length > 6) {
        setErrorMessage("Pincode should not exceed 6 digits for India");
        return;
      }
    }

    // Email validation with specific messages
    if (name.includes('Email') && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        if (name.includes('student') || name.includes('Student')) {
          setErrorMessage("Please enter a valid student email address");
        } else if (name.includes('father') || name.includes('Father')) {
          setErrorMessage("Please enter a valid father's email address");
        } else if (name.includes('mother') || name.includes('Mother')) {
          setErrorMessage("Please enter a valid mother's email address");
        } else {
          setErrorMessage("Please enter a valid email address");
        }
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handles changes for react-select components
  const handleSelectChange = (name, selectedOption) => {
    setErrorMessage("");
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));

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
        coaching_city: selectedOption ? selectedOption.value : "", // Also update coaching_city
      }));
    }
  };

  // Enhanced validation logic for each step
  const validationCheck = () => {
    if (step === 1) {
      // Basic required fields with specific error messages
      if (!classesfor) {
        setErrorMessage("Please select whether classes are for Child or Adult");
        return false;
      }
      if (!formData.studentFirstName) {
        setErrorMessage("Please enter student's first name");
        return false;
      }
      if (!formData.studentLastName) {
        setErrorMessage("Please enter student's last name");
        return false;
      }
      if (!formData.gender) {
        setErrorMessage("Please select gender");
        return false;
      }
      if (!formData.dob) {
        setErrorMessage("Please enter date of birth");
        return false;
      }

      // Name validations
      if (formData.studentFirstName.length < 2 || formData.studentFirstName.length > 50) {
        setErrorMessage("First name must be between 2-50 characters");
        return false;
      }
      if (formData.studentLastName.length < 2 || formData.studentLastName.length > 50) {
        setErrorMessage("Last name must be between 2-50 characters");
        return false;
      }

      // Name should only contain letters and spaces
      const nameRegex = /^[a-zA-Z\s]+$/;
      if (!nameRegex.test(formData.studentFirstName)) {
        setErrorMessage("First name should only contain letters and spaces");
        return false;
      }
      if (!nameRegex.test(formData.studentLastName)) {
        setErrorMessage("Last name should only contain letters and spaces");
        return false;
      }

      // Age validation from DOB
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 3) {
        setErrorMessage("Student must be at least 3 years old to register");
        return false;
      }
      if (age > 80) {
        setErrorMessage("Maximum age limit is 80 years for registration");
        return false;
      }

      // DOB should not be in future
      if (birthDate > today) {
        setErrorMessage("Date of birth cannot be in the future");
        return false;
      }

      // Age-category validation message
      if (classesfor === "Child" && age > 18) {
        setErrorMessage("Students above 18 years should select 'Adult' category");
        return false;
      }
      if (classesfor === "Adult" && age <= 18) {
        setErrorMessage("Students 18 years or below should select 'Child' category");
        return false;
      }

      // Adult validations
      if (classesfor !== "Child") {
        if (!formData.studentEmail || !formData.studentPhone) {
          setErrorMessage("Email and phone are required for adult registrations");
          return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.studentEmail)) {
          setErrorMessage("Please enter a valid email address");
          return false;
        }

        // Phone validation (basic)
        if (formData.studentPhone.length < 10) {
          setErrorMessage("Please enter a valid phone number");
          return false;
        }
      }
    }
    if (step === 2) {
      if (classesfor === "Child") {
        // At least one parent's complete details required
        const fatherComplete = formData.fatherFirstName && formData.fatherLastName &&
                              formData.fatherEmail && formData.fatherPhone;
        const motherComplete = formData.motherFirstName && formData.motherLastName &&
                              formData.motherEmail && formData.motherPhone;

        if (!fatherComplete && !motherComplete) {
          setErrorMessage("Please provide complete details for at least one parent");
          return false;
        }

        // Validate parent emails if provided
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.fatherEmail && !emailRegex.test(formData.fatherEmail)) {
          setErrorMessage("Please enter a valid father's email address");
          return false;
        }
        if (formData.motherEmail && !emailRegex.test(formData.motherEmail)) {
          setErrorMessage("Please enter a valid mother's email address");
          return false;
        }

        // Validate parent names
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (formData.fatherFirstName && !nameRegex.test(formData.fatherFirstName)) {
          setErrorMessage("Father's first name should only contain letters and spaces");
          return false;
        }
        if (formData.motherFirstName && !nameRegex.test(formData.motherFirstName)) {
          setErrorMessage("Mother's first name should only contain letters and spaces");
          return false;
        }

        // Phone validation for parents
        if (formData.fatherPhone && formData.fatherPhone.length < 10) {
          setErrorMessage("Please enter a valid father's phone number");
          return false;
        }
        if (formData.motherPhone && formData.motherPhone.length < 10) {
          setErrorMessage("Please enter a valid mother's phone number");
          return false;
        }
      }
    }

    if (step === 3) {
      // Specific address field validations
      if (!formData.country) {
        setErrorMessage("Please select your country");
        return false;
      }
      if (!formData.address_line1) {
        setErrorMessage("Please enter your address");
        return false;
      }
      if (!formData.state) {
        setErrorMessage("Please select your state");
        return false;
      }
      if (!formData.city) {
        setErrorMessage("Please select your city");
        return false;
      }
      if (!formData.pincode) {
        setErrorMessage("Please enter your pincode/postal code");
        return false;
      }

      // Address validation
      if (formData.address_line1.length < 5 || formData.address_line1.length > 200) {
        setErrorMessage("Address should be between 5-200 characters");
        return false;
      }

      // Pincode validation (6 digits for India)
      if (formData.country_code === "IN") {
        const pincodeRegex = /^\d{6}$/;
        if (!pincodeRegex.test(formData.pincode)) {
          setErrorMessage("Please enter a valid 6-digit pincode");
          return false;
        }
      } else {
        // Basic validation for other countries
        if (formData.pincode.length < 3 || formData.pincode.length > 10) {
          setErrorMessage("Please enter a valid postal code");
          return false;
        }
      }
    }

    if (step === 4) {
      if (!formData.mode) {
        setErrorMessage("Please select coaching mode (Online or Offline)");
        return false;
      }
      if (formData.mode === "Offline") {
        if (!formData.coaching_city) {
          setErrorMessage("Please select coaching city for offline classes");
          return false;
        }
        if (!formData.preferredCentre) {
          setErrorMessage("Please select preferred centre for offline classes");
          return false;
        }
      }
    }

    if (step === 5) {
      if (!formData.heardFrom) {
        setErrorMessage("Please select how you heard about us");
        return false;
      }

      if (formData.heardFrom === "Friends/Family") {
        if (!formData.refFirstName || !formData.refLastName) {
          setErrorMessage("Please provide referral person's name");
          return false;
        }

        // Validate referral names
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(formData.refFirstName)) {
          setErrorMessage("Referral first name should only contain letters and spaces");
          return false;
        }
        if (!nameRegex.test(formData.refLastName)) {
          setErrorMessage("Referral last name should only contain letters and spaces");
          return false;
        }

        if (formData.refFirstName.length < 2 || formData.refLastName.length < 2) {
          setErrorMessage("Referral names must be at least 2 characters long");
          return false;
        }
      }

      if (formData.heardFrom === "Other") {
        if (!formData.otherSource) {
          setErrorMessage("Please specify the source");
          return false;
        }
        if (formData.otherSource.length < 3 || formData.otherSource.length > 100) {
          setErrorMessage("Source description should be between 3-100 characters");
          return false;
        }
      }
      // T&C validation will be done in onSubmit
    }

    return true;
  };

  const nextStep = () => {
    setErrorMessage("");
    const result = validationCheck();

    if (result) {
      if (step === 1 && classesfor !== "Child") {
        setStep((prev) => prev + 2); // Skip parent details if not a child
      } else {
        setStep((prev) => prev + 1);
      }
    }
    // Error message is already set in validationCheck() function
  };

  const prevStep = () => {
    if (step === 3 && classesfor !== "Child") {
      setStep(1); // Go back to student details from address if not a child
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (e) => {
    debugger;
    setIsSubmitting(true);
    e.preventDefault(); // Prevent default form submission
    setErrorMessage(""); // Clear previous errors

    if (!tc1 || !tc2) {
      setErrorMessage("Please accept both terms and conditions.");
      setIsSubmitting(false);
      return;
    }

    // Captcha validation disabled
    // if (enteredCaptcha.toUpperCase() !== captcha.toUpperCase()) {
    //   setErrorMessage("Incorrect captcha. Please try again.");
    //   setIsSubmitting(false);
    //   return;
    // }

    // const recaptchaValue = recaptchaRef.current.getValue();

    // if (!recaptchaValue) {
    //   setErrorMessage("Please complete the 'I am not a robot' verification.");
    //   setIsSubmitting(false);
    //   return;
    // }

    try {
      // ReCaptcha verification disabled
      // const res = await fetch("/api/verify-recaptcha", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ token: recaptchaValue }),
      // });

      // const data = await res.json();

      // if (data.success) {
      if (true) { // Always proceed without captcha verification
        const templateParams = {
          studentFirstName: formData.studentFirstName,
          studentMiddleName: formData.studentMiddleName,
          studentLastName: formData.studentLastName,
          dob: formData.dob,
          gender: formData.gender,
          studentEmail: formData.studentEmail,
          studentPhone: formData.studentPhone,

          fatherFirstName: formData.fatherFirstName,
          fatherMiddleName: formData.fatherMiddleName,
          fatherLastName: formData.fatherLastName,
          fatherEmail: formData.fatherEmail,
          fatherPhone: formData.fatherPhone,
          motherFirstName: formData.motherFirstName,
          motherMiddleName: formData.motherMiddleName,
          motherLastName: formData.motherLastName,
          motherEmail: formData.motherEmail,
          motherPhone: formData.motherPhone,

          country: formData.country,
          country_code: formData.country_code,
          address_line1: formData.address_line1,
          address_line2: formData.address_line2,
          state: formData.state,
          city: formData.city,
          pincode: formData.pincode,

          mode: formData.mode,
          coaching_city: formData.coaching_city,
          preferredCentre: formData.preferredCentre,

          heardFrom: formData.heardFrom,
          refFirstName: formData.refFirstName,
          refLastName: formData.refLastName,
          otherSource: formData.otherSource,

          Terms_and_condition_one: formData.Terms_and_condition_one,
          Terms_and_condition_two: formData.Terms_and_condition_two,
        };

        try {
          // Save to Supabase first
          const courseRegistrationData = {
            participant_first_name: formData.studentFirstName,
            participant_last_name: formData.studentLastName,
            email: formData.studentEmail,
            phone: formData.studentPhone,
            age: formData.dob ? new Date().getFullYear() - new Date(formData.dob).getFullYear() : null,
            course_type: formData.mode,
            amount_paid: 0, // Course registration is free
            payment_status: 'completed', // No payment required
            // Additional course-specific data
            student_middle_name: formData.studentMiddleName,
            dob: formData.dob,
            gender: formData.gender,
            father_name: `${formData.fatherFirstName} ${formData.fatherLastName}`,
            father_email: formData.fatherEmail,
            father_phone: formData.fatherPhone,
            mother_name: `${formData.motherFirstName} ${formData.motherLastName}`,
            mother_email: formData.motherEmail,
            mother_phone: formData.motherPhone,
            country: formData.country,
            state: formData.state,
            city: formData.city,
            address: `${formData.address_line1} ${formData.address_line2}`,
            pincode: formData.pincode,
            coaching_city: formData.coaching_city,
            preferred_centre: formData.preferredCentre,
            heard_from: formData.heardFrom,
            referral_name: `${formData.refFirstName} ${formData.refLastName}`,
            other_source: formData.otherSource
          };

          // Save to Supabase
          const supabaseResponse = await fetch('/api/course-registration', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(courseRegistrationData),
          });

          if (supabaseResponse.ok) {
            console.log('✅ Course registration saved to Supabase');
          } else {
            console.error('❌ Failed to save to Supabase');
          }

          // Also save to Google Sheets (backup)
          const FORM_WEB_APP_URL =
            "https://script.google.com/macros/s/AKfycbzxBoE_OLGVSZvdAVz83Tql_uhenHe1anD363NOpz_yUKlVqeg-UBG2ufnDM_3hfkVFbQ/exec";

          fetch("/api/submit", {
            method: "POST",
            body: JSON.stringify({
              webAppUrl: FORM_WEB_APP_URL,
              templateParams,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((res) => res.json())
            .then((response) => {
              console.log("Google Sheets response:", response);
            })
            .catch((err) => {
              console.error("Error writing to Google Sheets:", err);
            });

          emailjs
            .send(
              "service_p5st95p", // replace with your service ID
              "template_exo2g59", // replace with your template ID
              templateParams,
              "TMT5AxQO_ZAQ5o_X5" // replace with your public key
            )
            .then(
              () => {
                message.success("Message sent successfully!");
                formRef.current.resetFields();
                setSuccesMessage("Form has been submitted Succesfully");
                setIsSubmitting(false);
              },
              (error) => {
                message.error("Failed to send message. Try again later.");
                setErrorMessage("There is an error submitting the form", error);
                setIsSubmitting(false);
              }
            );

          setSuccesMessage("Form submitted successfully!");
          // Reset form after successful submission
          setFormData({
            studentFirstName: "",
            studentMiddleName: "",
            studentLastName: "",
            dob: "",
            gender: "",
            studentEmail: "",
            studentPhone: "",

            fatherFirstName: "",
            fatherMiddleName: "",
            fatherLastName: "",
            fatherEmail: "",
            fatherPhone: "",
            motherFirstName: "",
            motherMiddleName: "",
            motherLastName: "",
            motherEmail: "",
            motherPhone: "",

            country: "",
            country_code: "",
            address_line1: "",
            address_line2: "",
            state: "",
            city: "",
            pincode: "",

            mode: "",
            coaching_city: "",
            preferredCentre: "",

            heardFrom: "",
            refFirstName: "",
            refLastName: "",
            otherSource: "",

            Terms_and_condition_one: "No",
            Terms_and_condition_two: "No",
          });
          setClassesFor("Child");
          setTc1(false);
          setTc2(false);
          setIsHuman(false);
          setEnteredCaptcha("");
          // Generate new captcha
          const newCaptcha = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();
          setCaptcha(newCaptcha);
          setStep(1); // Go back to first step
        } catch (error) {
          setErrorMessage("Failed to send form: " + error.text);
        }
      }
    } catch (err) {
      setErrorMessage("ReCaptcha verification failed, Please try again");
      return;
    } finally {
      setIsSubmitting(false);
      // recaptchaRef.current.reset(); // Disabled
    }
  };

  // Effects for country/state/city dropdowns
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

  // Generate random alphanumeric captcha on component mount
  useEffect(() => {
    const randomCaptcha = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    setCaptcha(randomCaptcha);
  }, []);

  return (
    <div>
      <form onSubmit={onSubmit}>
        {/* STUDENT DETAILS */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold mb-4">Student Details</h2>
            {/* Classes For */}
            <div className="flex md:flex-row flex-col gap-4 mb-4">
              {["Child", "Adult", "Sr Citizen"].map((val) => (
                <label key={val} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="classType" // This name doesn't directly map to formData, it controls `classesfor` state
                    value={val}
                    checked={classesfor === val}
                    onChange={() => setClassesFor(val)}
                    required
                  />
                  {val} (
                  {val === "Child"
                    ? "> 5 yrs ≤ 18 yrs"
                    : val === "Adult"
                    ? "> 18 yrs"
                    : "> 65 yrs"}
                  )
                </label>
              ))}
            </div>

            {/* Student Name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                name="studentFirstName"
                placeholder="First Name *"
                value={formData.studentFirstName}
                onChange={handleChange}
                required
                minLength="2"
                maxLength="50"
                pattern="[a-zA-Z\s]+"
                title="First name should only contain letters and spaces (2-50 characters)"
                className="p-2 border border-[#d3d1d1] rounded"
              />
              <input
                name="studentMiddleName"
                placeholder="Middle Name (Optional)"
                value={formData.studentMiddleName}
                onChange={handleChange}
                className="p-2 border border-[#d3d1d1] rounded"
              />
              <input
                name="studentLastName"
                placeholder="Last Name *"
                value={formData.studentLastName}
                onChange={handleChange}
                required
                minLength="2"
                maxLength="50"
                pattern="[a-zA-Z\s]+"
                title="Last name should only contain letters and spaces (2-50 characters)"
                className="p-2 border border-[#d3d1d1] rounded"
              />
            </div>

            {/* Gender */}
            <div className="flex gap-4 mt-4">
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

            {/* Date of Birth */}
            <div className=" mt-4">
              <label htmlFor="dob" className="mb-3 block">
                <span className="max-md:hidden text-md text-gray-800 font-[500]">
                  Date of Birth*
                </span>
                <span className="md:hidden text-sm text-gray-600">
                  Date of Birth (dd-mm-yyyy)*
                </span>
              </label>
              <input
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                required
                min="1944-01-01"
                max={new Date().toISOString().split('T')[0]}
                title="Please select a valid date of birth (DD/MM/YYYY format)"
                placeholder="DD/MM/YYYY"
                className="w-full max-md:w-[95%] p-2 border border-[#d3d1d1] rounded"
              />
            </div>

            {/* Contact details if Adult */}
            {classesfor !== "Child" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <input
                  name="studentEmail"
                  type="email"
                  placeholder="Student Email"
                  value={formData.studentEmail}
                  onChange={handleChange}
                  required={classesfor !== "Child"} // Make required only if not child
                  maxLength="255"
                  title="Please enter a valid email address"
                  className="p-2 border border-[#d3d1d1] rounded"
                />

                <PhoneInput
                  country={"in"} // default country
                  inputStyle={{ width: "100%", height: "40px" }}
                  enableSearch={true}
                  inputProps={{
                    name: "studentPhone",
                    required: classesfor !== "Child", // Make required only if not child
                  }}
                  value={formData.studentPhone} // Control value directly
                  onChange={(value, countryData, e, formattedValue) =>
                    setFormData((prev) => ({
                      ...prev,
                      studentPhone: formattedValue,
                    }))
                  }
                />
              </div>
            )}

            <button
              type="button"
              onClick={nextStep}
              className="bg-blue-500 mt-6 text-white p-2 rounded cursor-pointer"
            >
              Next
            </button>
          </>
        )}
        {/* PARENTS DETAILS */}
        {step === 2 && classesfor === "Child" && (
          <>
            <h2 className="text-xl font-bold">
              Parent Details <br />
              <span className="text-[16px] text-[#2B3AA0]">
                (Please provide either the mother’s or the father’s details.)
              </span>
            </h2>

            {/* Father Name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              <input
                name="fatherFirstName"
                placeholder="Father First Name*"
                value={formData.fatherFirstName}
                onChange={handleChange}
                className="p-2 border border-[#d3d1d1] rounded"
              />
              <input
                name="fatherMiddleName"
                placeholder="Middle Name (Optional)"
                value={formData.fatherMiddleName}
                onChange={handleChange}
                className="p-2 border border-[#d3d1d1] rounded"
              />
              <input
                name="fatherLastName"
                placeholder="Father Last Name*"
                value={formData.fatherLastName}
                onChange={handleChange}
                className="p-2 border border-[#d3d1d1] rounded"
              />
            </div>

            {/* Father Contact info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <input
                name="fatherEmail"
                type="email"
                placeholder="Father Email*"
                value={formData.fatherEmail}
                onChange={handleChange}
                className="p-2 border border-[#d3d1d1] rounded"
              />

              {/* Father phone number */}
              <PhoneInput
                country={"in"} // default country
                inputStyle={{ width: "100%", height: "40px" }}
                enableSearch={true}
                inputProps={{
                  name: "fatherPhone",
                  // Removed required here as it's optional if mother details are filled
                }}
                value={formData.fatherPhone}
                onChange={(value, countryData, e, formattedValue) =>
                  setFormData((prev) => ({
                    ...prev,
                    fatherPhone: formattedValue,
                  }))
                }
              />
            </div>

            {/* MOTHER Name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              <input
                name="motherFirstName"
                placeholder="Mother First Name*"
                value={formData.motherFirstName}
                onChange={handleChange}
                className="p-2 border border-[#d3d1d1] rounded"
              />
              <input
                name="motherMiddleName"
                placeholder="Middle Name (Optional)"
                value={formData.motherMiddleName}
                onChange={handleChange}
                className="p-2 border border-[#d3d1d1] rounded"
              />
              <input
                name="motherLastName"
                placeholder="Mother Last Name*"
                value={formData.motherLastName}
                onChange={handleChange}
                className="p-2 border border-[#d3d1d1] rounded"
              />
            </div>

            {/* Mother Contact details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <input
                name="motherEmail"
                type="email"
                placeholder="Mother Email*"
                value={formData.motherEmail}
                onChange={handleChange}
                className="p-2 border border-[#d3d1d1] rounded"
              />

              {/* Mother phone number */}
              <PhoneInput
                country={"in"} // default country
                inputStyle={{ width: "100%", height: "40px" }}
                enableSearch={true}
                inputProps={{
                  name: "motherPhone",
                  // Removed required here as it's optional if father details are filled
                }}
                value={formData.motherPhone}
                onChange={(value, countryData, e, formattedValue) =>
                  setFormData((prev) => ({
                    ...prev,
                    motherPhone: formattedValue,
                  }))
                }
              />
            </div>

            {/* BUTTONS */}
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-500 text-white p-2 rounded cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 text-white p-2 rounded cursor-pointer"
              >
                Next
              </button>
            </div>
          </>
        )}
        {/* ADDRESS DETAILS */}
        {step === 3 && (
          <>
            <h2 className="text-xl font-bold">Address Details</h2>
            {/* Country and Country code */}
            <div className="flex flex-col md:flex-row gap-3 items-center">
              {/* Country */}
              <div className="w-full md:w-[50%] mt-3">
                <Select
                  options={Country.getAllCountries().map((c) => ({
                    label: c.name,
                    value: c.isoCode,
                    phonecode: c.phonecode, // Not used, but kept for context
                  }))}
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

              {/* Country Code autoFilled */}
              <div className="w-full md:w-[50%] mt-3">
                <input
                  type="text"
                  readOnly
                  value={formData.country_code}
                  placeholder="Country Code"
                  className="w-full px-3 py-[7px] rounded border-solid border border-gray-300 bg-gray-100"
                />
              </div>
            </div>

            {/* Address Lines */}
            <input
              name="address_line1"
              placeholder="Address Line 1 *"
              value={formData.address_line1}
              onChange={handleChange}
              required
              className="w-full p-2 mt-3 border border-[#d3d1d1] rounded"
            />
            <input
              name="address_line2"
              placeholder="Address Line 2 (Optional)"
              value={formData.address_line2}
              onChange={handleChange}
              className="w-full p-2 mt-3 border border-[#d3d1d1] rounded"
            />

            {/* State */}
            <div className="mt-4">
              <Select
                options={states.map((s) => ({
                  label: s.name,
                  value: s.isoCode,
                }))}
                placeholder="Select a state *"
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

            {/* City */}
            <div className="mt-4">
              <Select
                options={cities.map((c) => ({
                  label: c.name,
                  value: c.name,
                }))}
                placeholder="Select a city *"
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

            <input
              name="pincode"
              placeholder="Pincode *"
              pattern="\d{6}" // Basic 6-digit number pattern
              value={formData.pincode}
              onChange={handleChange}
              required
              minLength="3"
              maxLength="10"
              title="Please enter a valid postal/pin code"
              className="w-full p-2 mt-3 border border-[#d3d1d1] rounded"
            />

            {/* Buttons */}
            <div className="flex justify-between mt-5">
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-500 text-white p-2 rounded cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="bg-blue-500 text-white p-2 rounded cursor-pointer"
              >
                Next
              </button>
            </div>
          </>
        )}
        {/* CENTER PREFERENCE */}
        {step === 4 && (
          <>
            <h2 className="text-xl font-bold">Centre Preference</h2>

            {/* Radio Buttons for Online/Offline */}
            <div className="flex gap-4 mt-3">
              <label>
                <input
                  type="radio"
                  name="mode"
                  value="Online"
                  checked={formData.mode === "Online"}
                  onChange={handleChange}
                  required
                />{" "}
                Online
              </label>
              <label>
                <input
                  type="radio"
                  name="mode"
                  value="Offline"
                  checked={formData.mode === "Offline"}
                  onChange={handleChange}
                  required
                />{" "}
                Offline
              </label>
            </div>

            {/* Only show below if Offline selected */}
            {formData.mode === "Offline" && (
              <select
                name="preferredCentre"
                value={formData.preferredCentre}
                onChange={handleChange}
                required
                className="w-full p-2 mt-3 border border-[#d3d1d1] rounded "
              >
                <option value="">Select Preferred Centre *</option>
                {centers.map((centre, i) => (
                  <option key={i} value={centre}>
                    {centre}
                  </option>
                ))}
              </select>
            )}

            <div className="flex justify-between mt-5">
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-500 text-white p-2 rounded cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="bg-blue-500 text-white p-2 rounded cursor-pointer"
              >
                Next
              </button>
            </div>
          </>
        )}
        {/* ReCAPTCHA */}
        {step === 5 && (
          <>
            <h2 className="text-xl font-bold">Referrals</h2>
            <select
              name="heardFrom"
              value={formData.heardFrom}
              onChange={handleChange}
              required
              className="w-full p-2 mt-3 border border-[#d3d1d1] rounded"
            >
              <option value="">How did you hear about us? *</option>
              <option>Newspaper</option>
              <option>Ads</option>
              <option>Social Media</option>
              <option>Billboard</option>
              <option>Banner</option>
              <option>Friends/Family</option>
              <option>Other</option>
            </select>

            {/* If Friends/Family */}
            {formData.heardFrom === "Friends/Family" && (
              <div className="flex flex-col md:flex-row gap-2 justify-center items-center mt-1">
                <label className="md:w-[220px] w-full">Referer by - </label>
                <input
                  name="refFirstName"
                  placeholder="First Name *"
                  value={formData.refFirstName}
                  onChange={handleChange}
                  required
                  className="w-full p-2 mt-3 border border-[#d3d1d1] rounded"
                />
                <input
                  name="refLastName"
                  placeholder="Last Name *"
                  value={formData.refLastName}
                  onChange={handleChange}
                  required
                  className="w-full p-2 mt-3 border border-[#d3d1d1] rounded"
                />
              </div>
            )}

            {/* If Other */}
            {formData.heardFrom === "Other" && (
              <input
                name="otherSource"
                placeholder="Please mention source *"
                value={formData.otherSource}
                onChange={handleChange}
                required
                className="w-full p-2 mt-3 border border-[#d3d1d1] rounded"
              />
            )}

            {/* Terms & Conditions 1 */}
            <div className="flex items-start gap-3 mt-3">
              <input
                name="Terms_and_condition_one"
                type="checkbox"
                checked={tc1}
                onChange={(e) => {
                  setTc1(e.target.checked);
                  setFormData((prev) => ({
                    ...prev,
                    Terms_and_condition_one: e.target.checked ? "Yes" : "No",
                  }));
                }}
                className="w-5 h-5 mt-1"
                required // Make the checkbox required for submission
              />
              <p>
                I understand that Thinq Chess will send SMS/WhatsApp or Emails
                with information about classes, tournaments, payment related and
                other promotional messages
              </p>
            </div>

            {/* Terms & Conditions 2 */}
            <div className="flex items-start gap-3 mt-3">
              <input
                name="Terms_and_condition_two"
                type="checkbox"
                checked={tc2}
                onChange={(e) => {
                  setTc2(e.target.checked);
                  setFormData((prev) => ({
                    ...prev,
                    Terms_and_condition_two: e.target.checked ? "Yes" : "No",
                  }));
                }}
                className="w-5 h-5 mt-1"
                required // Make the checkbox required for submission
              />
              <p>
                I understand the photos and videos taken at the centre may be
                used for promotional or Social media activity
              </p>
            </div>

            {/* Captcha - DISABLED */}
            {/* <div className="flex items-center space-x-3 mt-4">
              <label className="font-semibold">Captcha - </label>
              <input
                type="text"
                value={enteredCaptcha}
                onChange={(e) =>
                  setEnteredCaptcha(e.target.value.toUpperCase())
                }
                placeholder="Enter Captcha *"
                required
                className="border px-3 py-1 rounded w-32"
              />
              <span className="font-mono text-blue-700 text-lg">{captcha}</span>
            </div> */}

            {/* I am not a Robot - DISABLED */}
            {/* <div className="mt-6">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey="6LehpV8rAAAAABFbW0OBbIDomGf33mLs7YIoMyU1"
                onChange={() => setIsHuman(true)} // ReCAPTCHA passes null on expiry
                onExpired={() => setIsHuman(false)}
              />
            </div> */}

            <div className="flex justify-between mt-5">
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-500 text-white p-2 rounded cursor-pointer"
              >
                Previous
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white p-2 rounded cursor-pointer"
                disabled={isSubmitting} // Disable during submission
              >
                {isSubmitting ? "Submitting..." : "Register Now"}
              </button>
            </div>
          </>
        )}
      </form>
      {succesMessage && (
        <p className="text-green-600 text-[20px] font-[500] mt-4">
          {succesMessage}
        </p>
      )}
      {errorMessage.length > 0 && (
        <p className="text-red-800 text-[20px] font-[500] mt-4">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default MultiStepFormTwo;
