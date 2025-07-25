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

  const sendEmail = (values) => {
    setIsSubmitting(true);

    const templateParams = {
      parent_name: values.parentName,
      child_name: values.childName,
      age: values.Age,
      contact_number: `+${values.phone}`,
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

        {/* Address */}
        <div className="bg-[#f7f7f7] rounded-lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.573648578676!2d77.57720547358713!3d12.870791217083454!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae6ab40337aa89%3A0xb961c4e87c2873cb!2sAnu%20Provisions%2C%20J%20P%20Nagar!5e0!3m2!1sen!2sin!4v1749371718290!5m2!1sen!2sin"
            className="w-full h-full rounded-lg"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
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
                    onChange={(value, country, e, formattedValue) =>
                      console.log(value, formattedValue)
                    }
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
