//Login
const email=document.getElementById("email")
const password=document.getElementById("password")

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


function validateLogin(){
  let count=0;
  const emailValue=email.value.trim()
  const passwordValue=password.value.trim()
  
  if(emailValue === '') {
    setError(email, 'Email is required');
} else if (!isValidEmail(emailValue)) {
    setError(email, 'Provide a valid email address');
} else {
    count++;
    setSuccess(email);
    
}

if(passwordValue === '') {
    setError(password, 'Password is required');
} else if (passwordValue.length<8) {
    setError(password, 'Password must be at least 8 character.')
} else {
    count++;
    setSuccess(password);
    
}



  if(count==2){
      return true
  }else{
      return false;
  }

}

 

  
  

  

    