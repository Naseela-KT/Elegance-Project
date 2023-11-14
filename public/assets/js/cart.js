$(document).ready(function () {
    $('.qty-down, .qty-up').on('click', function (event) {
        event.preventDefault()
        var itemId = $(this).data('item-id');
        var operation = $(this).hasClass('qty-up') ? 1 : -1;
        var totalValElement=$('#total-amount');
        var totalValElement2=$('#totalAmount');
        var cartquantity=$("#cart-quantity")
        const selectedSize = $('#size').text();
        $.ajax({
            url: '/cart/updateQuantity',
            method: 'POST',
            data: { itemId: itemId, operation: operation,size:selectedSize}, 
            success: function (response) {
                if(response.error){
                    var spanElement = $('.qty-val[data-item-id="' + itemId + '"]');
                    spanElement.text(response.newQuantity);
                    Swal.fire({
                        icon: 'error',
                        title: "Error", 
                        text: response.error,  
                        confirmButtonText: "Close", 
                      });
                      
                }else{
                    var spanElement = $('.qty-val[data-item-id="' + itemId + '"]');
                    spanElement.text(response.newQuantity);
            
                    var subtotalElement = $('.subtotal[data-item-id="' + itemId + '"]');
                    subtotalElement.text(response.newSubtotal);
            
                    if (operation === -1 && parseInt($('#cart-quantity').text()) > 1) {
                        cartquantity.text(parseInt($('#cart-quantity').text()) - 1);
                        totalValElement.text(parseInt($('#total-amount').text()) - response.salePrice);
                        totalValElement2.text(parseInt($('#totalAmount').text()) - response.salePrice);
                    } else if (operation === 1) {
                        cartquantity.text(parseInt($('#cart-quantity').text()) + 1);
                        totalValElement.text(parseInt($('#total-amount').text()) + response.salePrice);
                        totalValElement2.text(parseInt($('#totalAmount').text()) + response.salePrice);
                    }
            
                    console.log(response);
                }
                    
                },
               
            
            error: function (error) {
               
            }
        });
        
    
})});









$('.address-radio').on('click', function () {
    var selectedAddressId = $(this).data('address-id');

    $.ajax({
        url: '/selectAddress', // Update the URL to match your server endpoint
        method: 'POST',
        data: { selectedAddressId: selectedAddressId },
        success: function (response) {
            console.log(response); // Handle the success response from the server
        },
        error: function (error) {
            console.error(error); // Handle errors, if any
        }
    });
});


