$(document).ready(function () {
    $(".small-image").hover(function () {
        $(".big-image").attr('src', $(this).attr('src'));
    });
});

$(document).ready(function () {
    $(".big-image").imagezoomsl({
        zoomrange: [3, 3]
    });
});



function addToCart(productId) {
    $.ajax({
      url: `/cart/add/${productId}`,
      method: 'get',
      success: (response) => {
         if (response=='login'){
            window.location.href = '/login';
        }
      }
    });
  }