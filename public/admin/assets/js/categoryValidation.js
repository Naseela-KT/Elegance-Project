const nameInput = document.getElementById('categoryName');
const offerInput = document.getElementById('category_offer');
const minInput = document.getElementById('min_amount');
const maxInput = document.getElementById('max_discount');
const dateInput = document.getElementById('category_expiry');

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


nameInput.addEventListener('input',()=>{
    const name=nameInput.value;
    validateName(name);
})



offerInput.addEventListener('input', () => {
    const offer= offerInput.value;
    validateOffer(offer);
    
});

minInput.addEventListener('input', () => {
    const min = minInput.value;
    validateMin(min);
    
});

maxInput.addEventListener('input', () => {
    const max= maxInput.value;
    validateMax(max);
});

dateInput.addEventListener('input', () => {
    const date= dateInput.value;
    validateDate(date);
});





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

function validateOffer(offer) {
    if(offer.trim().length<1){
        const message="Offer Cannot be empty"
        setError(offerInput,message)
        return false
    }
    if(offer>20 || offer<0){
        const message="Offer should be within 0 to 20%"
        setError(offerInput,message)
        return false
    }
    const message=""
    setSuccess(offerInput,message)
    return true
}

function validateMin(min) {
    if(min.trim().length < 1){
        const message="Min cannot be empty"
        setError(minInput,message)
        return false
    }
    if(min<500){
        const message="Min should be gte 500"
        setError(minInput,message)
        return false
    }
    const message=""
    setSuccess(minInput,message)
    return true
}

function validateMax(max) {
    if(max.trim().length < 1){
        const message="Max cannot be empty"
        setError(maxInput,message)
        return false
    }
    if(max>600){
        const message="Max cannot exceed 600"
        setError(maxInput,message)
        return false
    }
    const message=""
    setSuccess(maxInput,message)
    return true
}


function validateDate(date) {
    if(date.trim().length < 1){
        const message="Date cannot be empty"
        setError(dateInput,message)
        return false
    }
    const message=""
    setSuccess(dateInput,message)
    return true
}





function checkFormValidity() {
    const nameIsValid = validateName(nameInput.value);

    const isAnyOtherFieldNotEmpty =
        offerInput.value.trim().length > 0 ||
        minInput.value.trim().length > 0 ||
        maxInput.value.trim().length > 0 ||
        dateInput.value.trim().length > 0;

    if (isAnyOtherFieldNotEmpty) {
        const offerIsValid = validateOffer(offerInput.value);
        const minIsValid = validateMin(minInput.value);
        const maxIsValid = validateMax(maxInput.value);
        const dateIsValid = validateDate(dateInput.value);

        return nameIsValid && offerIsValid && minIsValid && maxIsValid && dateIsValid;
    } else {
        return nameIsValid;
    }
}



// function updateCategory(categoryId) {
//     if(checkFormValidity()){
//         var formData = new FormData(document.getElementById("categoryForm"));
//         console.log(formData);
    
//         fetch(`/admin/categories/edit?categoryId=${categoryId}`, {
//             method: 'PUT',
//             body: formData
//         })
//         .then(response => response.json())
//         .then(data => {
//             window.location.href = '/admin/categories';
//         })
//         .catch((error) => {
//             console.error('Error:', error);
//             window.location.href = `/admin/categories/edit?categoryId=${categoryId}`;
//             // Handle error, e.g., show an error message
//         });
//     }else{
//         return false;
//     }
   
// }


function updateCategory(categoryId) {
    if (checkFormValidity()) {
        var formData = new FormData(document.getElementById("categoryForm"));

        // Convert FormData to a plain object
        var formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        console.log(formObject);

        fetch(`/admin/categories/edit?categoryId=${categoryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObject),
        })
            .then(response => response.json())
            .then(data => {
                window.location.href = '/admin/categories';
            })
            .catch((error) => {
                console.error('Error:', error);
                window.location.href = `/admin/categories/edit?categoryId=${categoryId}`;
                // Handle error, e.g., show an error message
            });
    } else {
        return false;
    }
}
