const { response } = require("../../routes/userRoute");

function removeCartItem(proId) {
    $.ajax({
      url: `/cart/remove/${proId}`,
      method: 'get',
      success: (response) => {
        $(`.${proId}`).load(`/cart .${proId}`);
        $(`.zero`).load(`/cart .zero`);
        // console.log(proId);
        $('.totalProce').load('/cart .totalProce');
        $(`.rowToRemove${proId}`).remove();
        if (response =='reload') {
          window.location.href = '/cart';
          window.location.reload();
        } else {
          console.log('NO LOAD');
        }
      }
    });
  }


  function removebanerCartItem(proId) {
    $.ajax({
      url: `/cart/removebanner/${proId}`,
      method: 'get',
      success: (response) => {
        $('.totalProce').load('/cart .totalProce');
        $(`.rowToRemove${proId}`).remove();

        if (response === 'reload') {
          location.reload();
          window.location.href = '/cart';
        } else {
          console.log('NO LOAD');
        }
      }
    });
  }

function AddToCart(productId){
    $.ajax({
        url:`/cart/add/${productId}`,
        method:'get',
        success:(response)=>{
            // alert('skl')
            if (response == 'login'){
                window.location.href = '/login';
            }else{
            console.log(response);
            }
        }
    })
}
function AddbannerToCart(productId){
    $.ajax({
        url:`/cart/AddbannerToCart/${productId}`,
        method:'get',
        success:(response)=>{
            // alert('skl')
            if (response == 'login'){
                window.location.href = '/login';
            }else{
            console.log(response);
            }
        }
    })
}


function quantity(bannerId,count,curentquantity,max){
  $.ajax({
    url:`/cart/banner-quantity/?bannerId=${bannerId}&count=${count}&curentquantity=${curentquantity}&max=${max}`,
    method:'get',
    success:(response)=>{
      $(`.input-group-${bannerId}`).load(`/cart .input-group-${bannerId}`);
      $('.totalProce').load('/cart .totalProce');
      $(`#Total-${bannerId}`).load(`/cart #Total-${bannerId}`);



      $(`#quantity-input${bannerId}`).load(`/cart #quantity-input${bannerId}`)
      // alert(response);
    }
  })
}
function productquantity(productId,count,curentquantity,max){
  $.ajax({
    url:`/cart/product-quantity/?productId=${productId}&count=${count}&curentquantity=${curentquantity}&max=${max}`,
    method:'get',
    success:(response)=>{
      $(`.input-group-${productId}`).load(`/cart .input-group-${productId}`);
      $('.totalProce').load('/cart .totalProce');
      $(`#Total-${productId}`).load(`/cart #Total-${productId}`);


      $(`#quantity-input${productId}`).load(`/cart #quantity-input${productId}`)
      // alert(response);
    }
  })
}