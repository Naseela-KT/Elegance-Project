const productNameInput = document.getElementById('prodname');
const descriptionInput = document.getElementById('proddesc');
const colorInput = document.getElementById('prodcolor');
const sizeInputs = document.querySelectorAll('input[name="sizes[]"]');
const stockInputs = document.querySelectorAll('input[name="stocks[]"]');
const brandInput = document.getElementById('prodbrand');
const categoryInput = document.getElementById('prodcategory');
const regularPriceInput = document.getElementById('sprice');
const salePriceInput = document.getElementById('rprice');
const imageInput = document.getElementById('images');


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





const validateProductName = () => {
    const productName = productNameInput.value.trim();
    if (productName.length < 1) {
        setError(productNameInput, 'Product name cannot be empty');
        return false;
    }
    setSuccess(productNameInput);
    return true;
};

const validateDescription = () => {
    console.log("hello");
    const description = descriptionInput.value.trim();
    if (description.length < 1) {
        setError(descriptionInput, 'Description cannot be empty');
        return false;
    }
    setSuccess(descriptionInput);
    return true;
};

const validateColor = () => {
    const color = colorInput.value.trim();
    if (color.length < 1) {
        setError(colorInput, 'Color cannot be empty');
        return false;
    }
    setSuccess(colorInput);
    return true;
};

function validateSizeAndStock(sizeInput, stockInput) {
    const size = sizeInput.value.trim();
    const stock = stockInput.value.trim();
    let isValid = true;
    
    if (size.length < 1) {
        setError(sizeInput, 'Size cannot be empty');
        isValid = false;
    } else {
        setSuccess(sizeInput);
    }
    
    if (stock.length < 1 || isNaN(stock) || parseInt(stock) < 0) {
        setError(stockInput, 'Invalid stock');
        isValid = false;
    } else {
        setSuccess(stockInput);
    }
    
    return isValid;
}


function validateRegularPrice(){
    const regularPrice = regularPriceInput.value.trim();
    if (regularPrice.length < 1 || isNaN(regularPrice) || parseFloat(regularPrice) < 0) {
        setError(regularPriceInput, 'Invalid regular price');
        return false;
    }
    setSuccess(regularPriceInput);
    return true;
};

function validateSalePrice(){
    const salePrice = salePriceInput.value.trim();
    if (salePrice.length < 1 || isNaN(salePrice) || parseFloat(salePrice) < 0) {
        setError(salePriceInput, 'Invalid sale price');
        return false;
    }
    setSuccess(salePriceInput);
    return true;
};

function validateUpdateImages(input,length) {
    console.log('Validating images');
    
    const files = input.files;
    console.log('Number of selected files:', files.length);
    if (length < 3) {
        setError(input, 'Please select image to make it 3');
        return false;
    } else {
        setSuccess(input);
        return true;
    }
}

function validateImages(input){
    console.log('Validating images');
    
    const files = input.files;
    console.log('Number of selected files:', files.length);
    if (files.length< 1 || (!files)) {
        setError(input, 'Please select image to make it 3');
        return false;
    } else {
        setSuccess(input);
        return true;
    }
}




const validateInputs = () => {
    const regularPrice = parseFloat(regularPriceInput.value.trim());
    const salePrice = parseFloat(salePriceInput.value.trim());

    if (salePrice > regularPrice) {
        setError(salePriceInput, 'Sale price must be less than or equal to regular price');
        return false;
    }
    return (
        validateProductName() &&
        validateDescription() &&
        validateColor() &&
        validateRegularPrice() &&
        validateSalePrice() &&
        validateImages(imageInput)
    );
};


const validateEditInputs = (imagelength) => {
    const regularPrice = parseFloat(regularPriceInput.value.trim());
    const salePrice = parseFloat(salePriceInput.value.trim());

    if (salePrice > regularPrice) {
        setError(salePriceInput, 'Sale price must be less than or equal to regular price');
        return false;
    }
    return (
        validateProductName() &&
        validateDescription() &&
        validateColor() &&
        validateRegularPrice() &&
        validateSalePrice() &&
        validateUpdateImages(imageInput,imagelength)
    );
};


productNameInput.addEventListener('input', () => {
    validateProductName();
});

descriptionInput.addEventListener('input', () => {
    validateDescription();
});

colorInput.addEventListener('input', () => {
    validateColor();
});

sizeInputs.forEach((sizeInput, index) => {
    const stockInput = stockInputs[index];
    sizeInput.addEventListener('input', function() {
        validateSizeAndStock(sizeInput, stockInput);
    });
    stockInput.addEventListener('input', function() {
        validateSizeAndStock(sizeInput, stockInput);
    });
});

regularPriceInput.addEventListener('input', () => {
    validateRegularPrice();
});

salePriceInput.addEventListener('input', () => {
    validateSalePrice();
});

imageInput.addEventListener('change', function() {
    validateImages(imageInput);
});



function addSizeStockField() {
          
    var container = document.getElementById("sizeStockContainer");
    var clonedFields = container.lastElementChild.cloneNode(true);
    clonedFields.querySelectorAll('input').forEach(function(input) {
    input.value = '';
});

container.appendChild(clonedFields);
}

function updateProduct(productId,imagelength) {
    console.log(imagelength);
var formData = new FormData(document.getElementById("productForm"));
if(validateEditInputs(imagelength)){
    fetch(`/admin/products/edit`, {
        method: 'PUT',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            window.location.href = '/admin/products';
        })
        .catch((error) => {
            console.error('Error:', error);
            window.location.href = `/admin/products/edit?productId=${productId}`;
            // Handle error, e.g., show an error message
        });
}
}


