"use client";
import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Banner from "@/components/ui/Banner";
import { Form, Input, Radio, Row, Col, message } from "antd";

const { TextArea } = Input;

const BookADemo = () => {
  const formRef = useRef();
  const [succesMessage, setSuccesMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendEmail = (values) => {
    setIsSubmitting(true);
    const templateParams = {
      parent_name: values.parentName,
      email: values.email,
      contact_number: `+${values.phone}`,
      child_name: values.childName,
      age: values.Age,
      any_past_training: values.programLevel,
      state: values.state,
      country: values.country,
      message: values.message || "",
    };

    const FORM_WEB_APP_URL =
      "https://script.google.com/macros/s/AKfycbx-JQRROEdTU9KDqbeA4EDEFsnPCg4xJGzEtbHPVOGQZ14Qm7-f5wmG9HIA8_c27vtI/exec";

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
        "service_hk9vt4i", // replace with your service ID
        "template_tznhe4n", // replace with your template ID
        templateParams,
        "RXCvCuvaDD6zohMef" // replace with your public key
      )
      .then(
        () => {
          message.success("Message sent successfully!");
          formRef.current.resetFields();
          setSuccesMessage("Thank you we will get back to you with a slot.");
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
        heading={"Book a Demo"}
        image={"/images/about-banner.jpg"}
        link={"/"}
      />

      <section className="w-11/12 flex md:flex-row flex-col md:gap-16 gap-10 mx-auto my-10 md:my-28">
        <div className="md:w-[50%] w-full">
          <img src="/images/contact-img.png" className="w-full rounded-lg" />
        </div>
        <div className="md:w-[50%] w-full">
          <h2 className="md:mt-0 mt-2 md:text-5xl text-4xl leading-[52px] font-bold text-[#2B3AA0] md:leading-[60px]">
            Book a Demo
          </h2>
          <div className="md:mt-6 mt-6">
            <Form
              ref={formRef}
              layout="vertical"
              onFinish={sendEmail}
              autoComplete="off"
            >
              {/* Parent name */}
              <Form.Item
                name="parentName"
                rules={[
                  { required: true, message: "Please enter parent name" },
                ]}
              >
                <Input placeholder="Parent Name" />
              </Form.Item>

              {/* Contact no and Email */}
              <Row gutter={16}>
                <Col span={12}>
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
                    <Input placeholder="Email Address" />
                  </Form.Item>
                </Col>
                <Col span={12}>
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
                      inputStyle={{ width: "100%", height: "28px" }}
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
                </Col>
              </Row>

              {/* Child name */}
              <Form.Item
                name="childName"
                rules={[
                  {
                    required: true,
                    message: "Please enter child's name and age",
                  },
                ]}
              >
                <Input placeholder="Child’s Name" />
              </Form.Item>

              {/* Age and Program level */}
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
                  <Input placeholder="Age" />
                </Form.Item>
                <Form.Item
                  name="programLevel"
                  label="Have you taken formal chess training in the past?"
                  rules={[
                    { required: true, message: "Select a program level" },
                  ]}
                >
                  <Radio.Group>
                    <Radio value="male">Yes</Radio>
                    <Radio value="female">No</Radio>
                  </Radio.Group>
                </Form.Item>
              </div>

              {/* State and Country */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="state"
                    rules={[
                      { required: true, message: "Please enter your State" },
                    ]}
                  >
                    <Input placeholder="State" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="country"
                    rules={[
                      { required: true, message: "Please enter your country" },
                    ]}
                  >
                    <Input placeholder="Country" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="message">
                <TextArea placeholder="Message (optional)" rows={4} />
              </Form.Item>

              <Form.Item>
                <button
                  className={`bg-[#FFB31A] text-white text-[18px] rounded-lg px-8 py-2 ${
                    isSubmitting ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                  type="submit"
                  disabled={isSubmitting}
                >
                  Book a Demo
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

export default BookADemo;
