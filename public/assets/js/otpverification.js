const sendBtn = document.getElementById("sendotp");
const verifyBtn = document.getElementById("verifyotp");
const messageDiv = document.getElementById("message");
const validDiv=document.getElementById("validmsg");

sendBtn.addEventListener("click", function () {
  const email = document.getElementById("email").value;
  fetch("/send-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email}),
  })
    // .then((response) => response.json())
    .then((data) => {
      messageDiv.textContent = "Success";
      // You can handle the response here, e.g., show a success message or redirect the user.
    })
    .catch((error) => {
      console.error("Error:", error);
      messageDiv.textContent = "Error sending OTP. Please try again.";
    });
});


verifyBtn.addEventListener("click", function () {
    const otp = document.getElementById("otp").value;
    // const otp = document.getElementById('otp').value;
    // Send OTP verification request to the server using Ajax
    fetch("/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp: otp}),
    })
    //   .then((response) => response.json())
      .then((data) => {
        validDiv.textContent="Verified"
        // validDiv.textContent = "Success"+data;
        // You can handle the response here, e.g., show a success message or redirect the user.
      })
      .catch((error) => {
        validDiv.textContent = "Error verifying OTP. Please try again.";
      });
  });

  const verifyEmailBtn=document.getElementById("verifyemail");
  
  verifyEmailBtn.addEventListener("click", function () {
    const otp = document.getElementById("otp").value;
    // const otp = document.getElementById('otp').value;
    // Send OTP verification request to the server using Ajax
    fetch("/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp: otp}),
    })
    //   .then((response) => response.json())
      .then((data) => {
        validDiv.textContent="Verified"
        // validDiv.textContent = "Success"+data;
        // You can handle the response here, e.g., show a success message or redirect the user.
      })
      .catch((error) => {
        console.error("Error:", error);
        validDiv.textContent = "Error verifying OTP. Please try again.";
      });
  });

