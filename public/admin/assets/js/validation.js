const changeBtn=document.getElementById("activeBtn");
var email=document.getElementById("user-email").innerHTML

changeBtn.addEventListener("click", function () {
    changeBtn.innerHTML="Un-block"
    fetch("/change-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email}),
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

  