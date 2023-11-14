//Reset Password
const newpassword=document.getElementById("newpassword")
const confirmpassword=document.getElementById("cpassword")

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



function validatePassword(){
  let count=0;
  const newpasswordvalue=newpassword.value.trim()
  const cpassword=confirmpassword.value.trim()
  if(newpasswordvalue === '') {
      setError(password, 'Password is required');
  } else if (newpasswordvalue.length<8) {
      setError(newpassword, 'Password must be at least 8 character.')
  } else {
      count++;
      setSuccess(newpassword);
      
  }

  if(cpassword === '') {
      setError(confirmpassword, 'Confirm Password is required');
  } else if (cpassword!=newpasswordvalue) {
      setError(confirmpassword, 'Password should match.')
  } else {
      count++;
      setSuccess(confirmpassword);
      
  }


  if(count==2){
      return true
  }else{
      return false;
  }

}
