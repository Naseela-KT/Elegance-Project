const pnameInput=document.getElementById("profilename")
const pmobileInput=document.getElementById("profilemobile")
const nameRegex = /^[A-Za-z\s]{2,}$/;
const mobileRegex = /^[1-9]\d{9}$/;

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
    

     
    pnameInput.addEventListener('input', () => {
        console.log("hello");
        const pname = pnameInput.value;
        validateProfileName(pname);
    });
    pmobileInput.addEventListener('input', () => {
        const pmobile=pmobileInput.value;
        validateProfileMobile(pmobile);
    });


    
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
        console.log("hello");
        let pnameValid = validateProfileName(pnameInput.value);
        let pmobileValid=validateProfileMobile(pmobileInput.value)
        if(pnameValid && pmobileValid){
            return true;
        }else{
            return false;
        }
    }
   