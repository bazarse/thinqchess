"use client";
import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import Banner from "@/components/ui/Banner";
import { Form, Input, Select, Row, Col, message } from "antd";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const ContactUs = () => {
  const formRef = useRef();
  const [succesMessage, setSuccesMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLocation, setActiveLocation] = useState('jpnagar');
  const [phoneNumber, setPhoneNumber] = useState("");

  const sendEmail = (values) => {
    setIsSubmitting(true);

    const templateParams = {
      parent_name: values.parentName,
      child_name: values.childName,
      age: values.Age,
      contact_number: phoneNumber,
      email: values.email,
      state: values.state,
      country: values.country,
    };

    const FORM_WEB_APP_URL =
      "https://script.google.com/macros/s/AKfycbzSEM6rZjJHPuINGIErfg1CIvRys1Cb6i7kgNaYW-Y75J3IW4fwwRFxJkVwBJht2vB0Ag/exec";

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
        "service_p5st95p",
        "template_ff7qzba",
        templateParams,
        "TMT5AxQO_ZAQ5o_X5"
      )
      .then(
        () => {
          message.success("Message sent successfully!");
          formRef.current.resetFields();
          setSuccesMessage("Form has been submitted successfully");
          setIsSubmitting(false);
        },
        (error) => {
          message.error("Failed to send message. Try again later.");
          setErrorMessage("There is an error submitting the form", error);
          setIsSubmitting(false);
        }
      );
  };

  return (
    <>
      <Banner
        heading={" Let’s connect"}
        image={"/images/about-banner.jpg"}
        link={"/"}
      />

      <section className="w-11/12 max-md:flex max-md:flex-col md:grid grid-cols-3 grid-rows-1 gap-8 mx-auto my-28 mt-20">
        {/* Contact number */}
        <div className="px-10 py-10 bg-[#f7f7f7] rounded-lg">
          <div className="px-8 py-8 pb-6 bg-[#FFB31A] w-fit rounded-lg ">
            <i className="material-symbols-outlined text-white md:!text-[48px] !text-[32px]">
              call
            </i>
          </div>
          <div className="mt-8 flex flex-col gap-2">
            <h4 className="md:text-3xl text-2xl font-bold">
              <a href="tel:+919876543210">+91 7975820187</a>
            </h4>
          </div>
        </div>

        {/* Email Address */}
        <div className="px-10 py-10 bg-[#f7f7f7] rounded-lg">
          <div className="px-8 py-8 pb-6 bg-[#FFB31A] w-fit rounded-lg">
            <i className="material-symbols-outlined text-white md:!text-[48px] !text-[32px]">
              mail
            </i>
          </div>
          <div className="mt-8 flex flex-col gap-2">
            <h4 className="md:text-3xl text-2xl font-bold">
              <a href="mailto:admin@thinqchess.com">admin@thinqchess.com</a>
            </h4>
          </div>
        </div>

        {/* Locations */}
        <div className="px-10 py-10 bg-[#f7f7f7] rounded-lg">
          <div className="px-8 py-8 pb-6 bg-[#FFB31A] w-fit rounded-lg">
            <i className="material-symbols-outlined text-white md:!text-[48px] !text-[32px]">
              location_on
            </i>
          </div>
          <div className="mt-8 flex flex-col gap-6">
            <h4 className="md:text-3xl text-2xl font-bold text-[#2B3AA0]">
              Our Locations
            </h4>

            {/* JP Nagar Location */}
            <div className="border-l-4 border-[#2B3AA0] pl-4">
              <h5 className="text-xl font-semibold text-[#2B3AA0] mb-2">
                JP Nagar 8th Phase
              </h5>
              <p className="text-gray-700 text-sm mb-2">
                JP Nagar 8th Phase<br />
                Bangalore, Karnataka
              </p>
              <a
                href="https://www.google.com/maps/place/ThinQ+Chess+-+JP+Nagar+8th+Phase/@12.8705781,77.5771435,17z/data=!4m14!1m7!3m6!1s0x3bae6bfb70c1f8fb:0x930e1b9af0b9debd!2sThinQ+Chess+-+JP+Nagar+8th+Phase!8m2!3d12.8705781!4d77.5797184!16s%2Fg%2F11xmc_0zjc!3m5!1s0x3bae6bfb70c1f8fb:0x930e1b9af0b9debd!8m2!3d12.8705781!4d77.5797184!16s%2Fg%2F11xmc_0zjc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2B3AA0] hover:text-[#1e2a70] underline text-sm"
              >
                📍 View on Google Maps
              </a>
            </div>

            {/* Akshayanagar Location */}
            <div className="border-l-4 border-[#FFB31A] pl-4">
              <h5 className="text-xl font-semibold text-[#2B3AA0] mb-2">
                Akshayanagar
              </h5>
              <p className="text-gray-700 text-sm mb-2">
                3rd Floor, Karthikeya Complex<br />
                Mahaveer Road, Akshayanagar Gardens<br />
                West, Akshayanagar<br />
                Bengaluru, Karnataka 560068
              </p>
              <a
                href="https://www.google.com/maps/place/ThinQ+Chess+-+Akshayanagar/@12.8750299,77.6134597,17z/data=!4m14!1m7!3m6!1s0x466bc668dec53c91:0x9d04e17d485fbb41!2sThinQ+Chess+-+Akshayanagar!8m2!3d12.8750299!4d77.6134597!16s%2Fg%2F11xk_41yxg!3m5!1s0x466bc668dec53c91:0x9d04e17d485fbb41!8m2!3d12.8750299!4d77.6134597!16s%2Fg%2F11xk_41yxg?entry=ttu&g_ep=EgoyMDI1MDgyNS4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2B3AA0] hover:text-[#1e2a70] underline text-sm"
              >
                📍 View on Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="w-11/12 mx-auto my-20">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-[#2B3AA0] mb-4">
            Visit Our Academies
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We have two convenient locations in Bangalore. Choose the one that's closest to you!
          </p>
        </div>

        {/* Location Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setActiveLocation('jpnagar')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeLocation === 'jpnagar'
                  ? 'bg-[#2B3AA0] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#2B3AA0]'
              }`}
            >
              JP Nagar 8th Phase
            </button>
            <button
              onClick={() => setActiveLocation('akshayanagar')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeLocation === 'akshayanagar'
                  ? 'bg-[#2B3AA0] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#2B3AA0]'
              }`}
            >
              Akshayanagar
            </button>
          </div>
        </div>

        {/* JP Nagar Map */}
        {activeLocation === 'jpnagar' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-[#2B3AA0] text-white p-4">
              <h3 className="text-xl font-semibold">ThinQ Chess - JP Nagar 8th Phase</h3>
              <p className="text-blue-100">JP Nagar 8th Phase, Bangalore, Karnataka</p>
            </div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.5736485786764!2d77.57714357358713!3d12.870578117083454!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae6bfb70c1f8fb%3A0x930e1b9af0b9debd!2sThinQ%20Chess%20-%20JP%20Nagar%208th%20Phase!5e0!3m2!1sen!2sin!4v1734567890123!5m2!1sen!2sin"
              className="w-full h-96 md:h-[500px]"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="ThinQ Chess Academy - JP Nagar 8th Phase Location"
            ></iframe>
          </div>
        )}

        {/* Akshayanagar Map */}
        {activeLocation === 'akshayanagar' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-[#FFB31A] text-white p-4">
              <h3 className="text-xl font-semibold">ThinQ Chess - Akshayanagar</h3>
              <p className="text-orange-100">3rd Floor, Karthikeya Complex, Mahaveer Road, Akshayanagar Gardens, West, Akshayanagar, Bengaluru, Karnataka 560068</p>
            </div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0736!2d77.6108847!3d12.8750299!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x466bc668dec53c91%3A0x9d04e17d485fbb41!2sThinQ%20Chess%20-%20Akshayanagar!5e0!3m2!1sen!2sin!4v1734567890124!5m2!1sen!2sin"
              className="w-full h-96 md:h-[500px]"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="ThinQ Chess Academy - Akshayanagar Location"
            ></iframe>
          </div>
        )}
      </section>

      <section className="w-11/12 flex md:flex-row flex-col md:gap-16 gap-10 mx-auto my-10 md:my-28 md:mb-10">
        <div className="md:w-[50%] w-full">
          <img src="/images/contact-img.png" className="w-full rounded-lg" />
        </div>
        <div className="md:w-[50%] w-full">
          <h2 className="md:mt-5 mt-2 md:text-5xl text-4xl leading-[52px] font-bold text-[#2B3AA0] md:leading-[60px]">
            Contact Us Today
          </h2>
          <div className="md:mt-10 mt-6">
            <Form
              ref={formRef}
              layout="vertical"
              onFinish={sendEmail}
              autoComplete="off"
            >
              {/* Parent and child name */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="parentName"
                    rules={[
                      { required: true, message: "Please enter parent name" },
                    ]}
                  >
                    <Input placeholder="Parent Name*" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="childName"
                    rules={[
                      {
                        required: true,
                        message: "Please enter child's name and age",
                      },
                    ]}
                  >
                    <Input placeholder="Child’s Name*" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Age and Contact number */}
              <div>
                <Form.Item
                  name="Age"
                  rules={[
                    {
                      required: true,
                      message: "Please enter contact number",
                    },
                  ]}
                >
                  <Input placeholder="Age in Years*" />
                </Form.Item>
                <Form.Item
                  name="phone"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your phone number",
                    },
                  ]}
                >
                  <PhoneInput
                    country={"in"} // default country
                    inputStyle={{ width: "100%" }}
                    enableSearch={true}
                    inputProps={{
                      name: "phone",
                      required: true,
                    }}
                    value={phoneNumber}
                    onChange={(value, country, e, formattedValue) => {
                      setPhoneNumber(value); // Store raw value without hyphens
                      console.log(value, formattedValue);
                    }}
                  />
                </Form.Item>
              </div>

              {/* email and location */}
              <div>
                <Form.Item
                  name="email"
                  rules={[
                    {
                      required: true,
                      type: "email",
                      message: "Enter a valid email",
                    },
                  ]}
                >
                  <Input placeholder="Email Address*" />
                </Form.Item>
                <Form.Item
                  name="state"
                  rules={[
                    { required: true, message: "Please enter your State" },
                  ]}
                >
                  <Input placeholder="State*" />
                </Form.Item>
                <Form.Item
                  name="country"
                  rules={[
                    { required: true, message: "Please enter your country" },
                  ]}
                >
                  <Input placeholder="Country*" />
                </Form.Item>
              </div>

              <Form.Item>
                <button
                  className={`bg-[#FFB31A] text-white text-[18px] rounded-lg px-8 py-2 ${
                    isSubmitting ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                  type="submit"
                  disabled={isSubmitting}
                >
                  Submit now
                </button>
              </Form.Item>
            </Form>
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
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactUs;
