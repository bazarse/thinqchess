// utils/loadRazorpay.ts
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.querySelector("#razorpay-sdk")) {
      resolve(true); // already loaded
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};
