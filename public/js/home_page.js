
function addToCart(productId) {
    $.ajax({
      url: `/cart/add/${productId}`,
      method: 'get',
      success: (response) => {
        if (response === 'Please Login') {
          alert('User not logged in');
        } else if (response === 'success') {
          alert('Product added to cart successfully');
        } else {
          alert('An error occurred');
        }
      },
    });
  }