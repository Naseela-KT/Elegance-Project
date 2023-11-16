


const h1Input = document.getElementById('h1');
const h2Input = document.getElementById('h2');
const h3Input = document.getElementById('h3');
const p1Input = document.getElementById('p1');
const cdescInput = document.getElementById('cdesc');
const imageInput = document.getElementById('image');
const bannerForm=document.getElementById("bannerForm")


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

document.addEventListener('DOMContentLoaded', function () {
h1Input.addEventListener('input',()=>{
    const h1=h1Input.value;
    validateField(h1,h1Input);
})
});



h2Input.addEventListener('input', () => {
    const h2= h2Input.value;
    validateField(h2,h2Input);
    
});

h3Input.addEventListener('input', () => {
    const h3= h3Input.value;
    validateField(h3,h3Input);
    
});

p1Input.addEventListener('input', () => {
    const p1= p1Input.value;
    validateField(p1,p1Input);
});

cdescInput.addEventListener('input', () => {
    const desc= cdescInput.value;
    validateField(desc,cdescInput);
});

imageInput.addEventListener('change', () => {
    validateImage(imageInput);
});





function validateField(field,input) {
    if(field.trim().length < 1){
        const message="Field cannot be empty"
        setError(input,message)
        return false
    }
    const message=""
    setSuccess(input,message)
    return true
}

function validateImage(input) {
    if (!input.value) {
        const message = "Please choose a file.";
        setError(input, message);
        return false;
    }

    const message = "";
    setSuccess(input, message);
    return true;
}




function checkFormValidity(event) {
    event.preventDefault()
    const h1IsValid = validateField(h1Input.value,h1Input);
    const h2IsValid = validateField(h2Input.value,h2Input);
    const h3IsValid = validateField(h3Input.value,h3Input);
    const p1IsValid = validateField(p1Input.value,p1Input);
    const cdescValid=validateField(cdescInput.value,cdescInput)
    const imageIsValid = validateImage(imageInput);

    if(h1IsValid && h2IsValid && h3IsValid && p1IsValid && cdescValid && imageIsValid){
        bannerForm.submit();
    }else{
        return false;
    }
}

function checkEditFormValidity() {
    // event.preventDefault()
    const h1IsValid = validateField(h1Input.value,h1Input);
    const h2IsValid = validateField(h2Input.value,h2Input);
    const h3IsValid = validateField(h3Input.value,h3Input);
    const p1IsValid = validateField(p1Input.value,p1Input);
    const cdescValid=validateField(cdescInput.value,cdescInput)

    if(h1IsValid && h2IsValid && h3IsValid && p1IsValid && cdescValid){
        // bannerForm.submit();
        return true
    }else{
        return false;
    }
}



function updateBanner(bannerId) {
    if (checkEditFormValidity()) {
        var formData = new FormData(document.getElementById("bannerForm"));

        // Convert FormData to a plain object
        var formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        console.log(formData);

        fetch(`/admin/editBanner`, {
            method: 'PUT',
            // headers: {
            //     'Content-Type': 'application/json',
            // },
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                if(data){
                    window.location.href = '/admin/banner';
                }else{
                    window.location.href = `/admin/editBanner?id=${bannerId}`;
                }
               
            })
            .catch((error) => {
                console.error('Error:', error);
                window.location.href = `/admin/editBanner?id=${bannerId}`;
                // Handle error, e.g., show an error message
            });
    } else {
        return false;
    }
}