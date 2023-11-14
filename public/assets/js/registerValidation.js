

        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const mobileInput = document.getElementById('phone');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput=document.getElementById('cpassword')
        const submitButton = document.getElementById('submitButton');
        const sendOTPBtn=document.getElementById("sendotp")
        const referralInput=document.getElementById("referral");

        const nameRegex = /^[A-Za-z\s]{2,}$/;
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        const mobileRegex = /^[1-9]\d{9}$/;
        const codeRegx = /[1-9]\d$/;
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


        referralInput.addEventListener('input',()=>{
            const code=referralInput.value;
            validateCode(code);
        })
        
        nameInput.addEventListener('input', () => {
            const name = nameInput.value;
            validateName(name);
            
        });
        
        emailInput.addEventListener('input', () => {
            const email = emailInput.value;
            validateEmail(email);
            
        });
        
        mobileInput.addEventListener('input', () => {
            const mobile = mobileInput.value;
            validateMobile(mobile);
            
        });
        
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            validatePassword(password);
        });

        confirmPasswordInput.addEventListener('input', () => {
            const pass=passwordInput.value;
            const password = confirmPasswordInput.value;
            validateConfirmPassword(pass,password);
            
        });
        
        function validateCode(code) {
            if(!codeRegx.test(code.trim())){
                const message="Enter a valid code"
                setError(referralInput,message)
                return false
            }
            if(code.trim().length < 6 || code.trim().length>6){
                const message="Code length should be 6"
                setError(referralInput,message)
                return false
            }
            const message=""
            setSuccess(referralInput,message)
            return true
        }


        function validateName(name) {
            if(name.trim().length < 1){
                const message="Name cannot be empty"
                setError(nameInput,message)
                return false
            }
            if(!nameRegex.test(name.trim())){
                const message="Enter a valid name"
                setError(nameInput,message)
                return false
            }
            const message=""
            setSuccess(nameInput,message)
            return true
        }
        
        function validateEmail(email) {
            if(email.trim().length < 1){
                const message="Email cannot be empty"
                setError(emailInput,message)
                return false
            }
            if(!emailRegex.test(email.trim())){
                const message="Enter a valid email Id"
                setError(emailInput,message)
                return false
            }
            const message=""
            setSuccess(emailInput,message)
            return true
        }
        
        function validateMobile(mobile) {
            if(mobile.trim().length < 1){
                const message="Mobile cannot be empty"
                setError(mobileInput,message)
                return false
            }
            if(!mobileRegex.test(mobile.trim())){
                const message="Enter a valid mobile number"
                setError(mobileInput,message)
                return false
            }
            const message=""
            setSuccess(mobileInput,message)
            return true
        }
        
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
        
        function checkFormValidity() {
            let nameIsValid = validateName(nameInput.value);
            let emailIsValid = validateEmail(emailInput.value);
            let mobileIsValid = validateMobile(mobileInput.value);
            let passwordIsValid = validatePassword(passwordInput.value);
            let confirmPassword=validateConfirmPassword(passwordInput.value,confirmPasswordInput.value)
            clearInterval(timer);
    // Reset the timer started flag
    timerStarted = false;
    // Reset the timer count and button text
    timerCount = 30;
    document.getElementById('timer').textContent = '';
    // document.getElementById('sendotp').textContent = 'Resend OTP';
        
            if (nameIsValid && emailIsValid && mobileIsValid && passwordIsValid && confirmPassword) {
                return true
            } else {
                return false
            }
        }

        function checkEmail(){
            let emailIsValid = validateEmail(emailInput.value);
            if(emailIsValid){
                return true
            }else{
                return false
            }
        }
        
        

var timer;
var timerCount = 30; // Timer set to 30 seconds
var timerStarted = false; // Flag to track whether the timer has started or not

function startTimer() {
    timer = setInterval(function() {
        document.getElementById('timer').textContent = 'Resend OTP in ' + timerCount + 's';
        timerCount--;
        if (timerCount < 0) {
            clearInterval(timer);
            document.getElementById('timer').textContent = '';
            document.getElementById('sendotp').textContent = 'Resend OTP';
            timerCount = 30; // Reset the timer count
            timerStarted = false; // Reset the timer started flag
        }
    }, 1000);
}

document.getElementById('sendotp').addEventListener('click', function() {
    // If the timer has not started, start it
    let emailIsValid = validateEmail(emailInput.value);
            if(emailIsValid){
                if (!timerStarted) {
        // Perform your OTP sending logic here
        
        // Start the timer
                startTimer();
                timerStarted = true; // Set the timer started flag to true
            }else{
                timerStarted = false;
            }
    // ... your existing code for sending OTP ...
}});

// Function to check form validity when submitting

document.getElementById('otp').addEventListener('input', function() {
    // If the user starts typing OTP, clear the timer
    clearInterval(timer);
    document.getElementById('timer').textContent = '';
    document.getElementById('sendotp').textContent = 'Resend OTP';
    timerCount = 30; // Reset the timer count
    timerStarted = false; // Reset the timer started flag
});
