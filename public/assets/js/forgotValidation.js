//Forgot-page
const email=document.getElementById("email")
const otp=document.getElementById("otp")

const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success')
}

const setSuccess = element => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = '';
    // inputControl.classList.add('success');
    inputControl.classList.remove('error');
    // if (document.querySelectorAll('.success').length === 4) {
    //     form.submit(); 
    // }
};

const isValidEmail = email => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}


function validateForgotPage(){
  let count=0;
  const emailValue=email.value.trim()
  const otpValue=otp.value.trim()
  
  if(emailValue === '') {
    setError(email, 'Email is required');
} else if (!isValidEmail(emailValue)) {
    setError(email, 'Provide a valid email address');
} else {
    count++;
    setSuccess(email);
    
}

if(otpValue === '') {
    setError(otp, 'OTP is required');
} else if (otpValue.length<4 || otpValue.length>4) {
    setError(otp, 'OTP should contain 4 digits')
} else {
    count++;
    setSuccess(otp);
    
}



  if(count==2){
      return true
  }else{
      return false;
  }

}
