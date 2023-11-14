 //REVIEW
 //Validation
 const commentForm=document.getElementById("commentForm");
 function validateReview(){
   const rname=document.getElementById("name");
   const rating=document.getElementById("rating")
   let count=0;
   const rnameValue = rname.value.trim();
   const ratingValue = rating.value.trim();
   
   const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
   if(rnameValue === '') {
       setError(rname, 'Name is required');
   }else if(/\d/.test(rnameValue)){
       setError(rname, 'Name cannot contain numbers!');
   }else if(specialChars.test(rnameValue)){
       setError(rname, 'Name cannot contain spectial characters!');
   }else {
       count++;
       setSuccess(rname);
      
   }


   if (ratingValue=="" || ratingValue==null) {
       setError(rating, 'Rating cannot be Blank!');
   }else if (isNaN(ratingValue)){
       setError(rating, 'Rating cannot contain letters!');
   }else if (ratingValue>5){
       setError(rating, 'Enter a valid rating');
   }else{
       count++;
       setSuccess(rating);
       
   }

   if(count==2){
       return true
   }else{
       return false
   }

};

const submitReviewBtn=document.getElementById("submitReview")

submitReviewBtn.addEventListener("click", function () {
   fetch("/productReview", {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     }
   })
     .then((data) => {
       console.log(data);
     })
     .catch((error) => {
       console.error("Error:", error);
       // validDiv.textContent = "Error verifying OTP. Please try again.";
     });
 });





 var selectedSize="";
$(document).ready(function() {
    // Event listener for size options
    $('.size-option').on('click', function(event) {
        $('#size-selection').text("");
        selectedSize = $(this).data('size');
        console.log('Selected Size:', selectedSize);
    });
});


 //Adding Product to Cart
 function addToCart(productId) {
    if(selectedSize.length==0){
        $('#size-selection').text("Please select a size")
    }else{
        fetch('/add-to-cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId: productId,size:selectedSize })
        })
        // .then(response => response.json())
        .then(data => {
            window.location.href = '/cart'
            
        })
        .catch(error => {
            // Handle any errors that occurred during the fetch
            console.error('Error:', error);
        });
    }
    
}







