const passwordInput=document.getElementById("upassword")
const confirmPasswordInput=document.getElementById("ucpassword")

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
    };


    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        validatePassword(password);
    });
    confirmPasswordInput.addEventListener('input', () => {
        const pass=passwordInput.value;
        const password = confirmPasswordInput.value;
        validateConfirmPassword(pass,password);
        
    });

    function validatePassword(password) {
        if(password.trim().length < 1){
            const message="Password cannot be empty"
            setError(passwordInput,message)
            return false
        }
        if(!passwordRegex.test(password.trim())){
            const message="Password must contain uppercase,lowercase,special character and digits"
            setError(passwordInput,message)
            return false
        }
        const message=""
        setSuccess(passwordInput,message)
        return true
    }


    function validateConfirmPassword(pass,confirm){
        if(confirm.trim().length<1){
            const message="Confirm Password Cannot be empty"
            setError(confirmPasswordInput,message)
            return false
        }
        if(pass!==confirm){
            const message="Password should be same"
            setError(confirmPasswordInput,message)
            return false
        }
        const message=""
        setSuccess(confirmPasswordInput,message)
        return true
    }

    function checkPwdValidity(){
        let passwordIsValid = validatePassword(passwordInput.value);
        let confirmPassword=validateConfirmPassword(passwordInput.value,confirmPasswordInput.value)
        if(passwordIsValid && confirmPassword){
            return true;
        }else{
            return false;
        }
    }


//Edit Profile

const pnameInput=document.getElementById("profilename")
const pmobileInput=document.getElementById("profilemobile")
const nameRegex = /^[A-Za-z\s]{2,}$/;
const mobileRegex = /^[1-9]\d{9}$/;

pnameInput.addEventListener('input', () => {
    const pname = pnameInput.value;
    validateProfileName(pname);
});
pmobileInput.addEventListener('input', () => {
    const pmobile=pmobileInput.value;
    validateProfileMobile(pmobile);
});

function validateProfileName(name) {
    if(name.trim().length < 1){
        const message="Name cannot be empty"
        setError(pnameInput,message)
        return false
    }
    if(!nameRegex.test(name.trim())){
        const message="Enter a valid name"
        setError(pnameInput,message)
        return false
    }
    const message=""
    setSuccess(pnameInput,message)
    return true
}

function validateProfileMobile(mobile) {
    if(mobile.trim().length < 1){
        const message="Mobile cannot be empty"
        setError(pmobileInput,message)
        return false
    }
    if(!mobileRegex.test(mobile.trim())){
        const message="Enter a valid mobile number"
        setError(pmobileInput,message)
        return false
    }
    const message=""
    setSuccess(pmobileInput,message)
    return true
}

function checkEditProfileValidity(){
    let pnameValid = validateProfileName(pnameInput.value);
    let pmobileValid=validateProfileMobile(pmobileInput.value)
    if(pnameValid && pmobileValid){
        return true;
    }else{
        return false;
    }
}


//Edit-Address
const adnameInput=document.getElementById("adname")
const admobileInput=document.getElementById("admobile")
const adhnameInput=document.getElementById("adhname")
const adcityInput=document.getElementById("adcity")
const adstateInput=document.getElementById("adstate")
const adpinInput=document.getElementById("adpin")

const pinRegex=/^\d{6}$/;




    adnameInput.addEventListener('input', () => {
        const name = adnameInput.value;
        validateName(name,adnameInput);
    });
    
    admobileInput.addEventListener('input', () => {
        const mobile = admobileInput.value;
        validateMobile(mobile);
    });

    adhnameInput.addEventListener('input', () => {
        const name = adhnameInput.value;
        validateName(name,adhnameInput);
    });

    adcityInput.addEventListener('input', () => {
        const name = adcityInput.value;
        validateName(name,adcityInput);
    });
    
    adstateInput.addEventListener('input', () => {
        const email = adstateInput.value;
        validateName(email,adstateInput);
    });
    adpinInput.addEventListener('input', () => {
        const pin = adpinInput.value;
        validatePin(pin);
    });


    function validateName(name,inputField) {
        if(name.trim().length < 1){
            const message="Field cannot be empty"
            setError(inputField,message)
            return false
        }
        if(!nameRegex.test(name.trim())){
            const message="Enter a valid name"
            setError(inputField,message)
            return false
        }
        const message=""
        setSuccess(inputField,message)
        return true
    }
    
    function validateMobile(mobile) {
        if(mobile.trim().length < 1){
            const message="Mobile cannot be empty"
            setError(admobileInput,message)
            return false
        }
        if(!mobileRegex.test(mobile.trim())){
            const message="Enter a valid mobile number"
            setError(admobileInput,message)
            return false
        }
        const message=""
        setSuccess(admobileInput,message)
        return true
    }

    function validatePin(pin) {
        if(pin.trim().length < 1){
            const message="Pin cannot be empty"
            setError(adpinInput,message)
            return false
        }
        if(!pinRegex.test(pin.trim())){
            const message="Enter a valid pin"
            setError(adpinInput,message)
            return false
        }
        const message=""
        setSuccess(adpinInput,message)
        return true
    }


    function checkEditAddressValidity(){
        let adname = validateName(adnameInput.value);
        let admobile = validateMobile(admobileInput.value);
        let adhname = validateName(adhnameInput.value);
        let adcity = validateName(adcityInput.value);
        let adstate = validateName(adstateInput.value);
        let adpin = validatePin(adpinInput.value);
        if(adname && admobile && adhname && adcity && adstate && adpin){
            return true;
        }else{
            return false;
        }
    }