const adnameInput=document.getElementById("adname")
const admobileInput=document.getElementById("admobile")
const adhnameInput=document.getElementById("adhname")
const adcityInput=document.getElementById("adcity")
const adstateInput=document.getElementById("adstate")
const adpinInput=document.getElementById("adpin")

const mobileRegex = /^[1-9]\d{9}$/;
const nameRegex = /^[A-Za-z\s]{2,}$/;
const pinRegex=/^\d{6}$/;

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