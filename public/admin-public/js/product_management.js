const { response } = require("../../../routes/userRoute");


function productStatusAction(productId, status) {
  $.ajax({
    url: `/admin/dashboard/product/action?id=${productId}&status=${status}`,
    method: 'get',
    success: () => {
      $(`.statusss${productId}-${status}`).load(`/admin/dashboard/product .statusss${productId}-${status}`);
      $(`.statuss${productId}`).load(`/admin/dashboard/product .statuss${productId}`);
      $(`.status${productId}`).load(`/admin/dashboard/product .status${productId}`);
    }
  });
}

// function productImagDelete(productId,imgId){
//   $.ajax({
//     url:`/admin/dashboard/product/edit-product/delete-img?id=${productId}&img=${imgId}`,
//     method:'get',
//     success:(response)=>{
//       $(`.deleteImg${bannerId}`).find(`img[src="/proImages/${imgId}"]`).parent().siblings('div').find('button[data-img]').remove();
//       $(`.deleteImg${bannerId}`).find(`img[src="/proImages/${imgId}"]`).parent().remove();
//       $(`.imagPart`).load(`/admin/dashboard/banner/edit-banner${bannerId} .imagPart`);
//     }
//   })
// }
// function productImagDelete(productId, imgId) {
//   $.ajax({
//     url: `/admin/dashboard/product/edit-product/delete-img?id=${productId}&img=${imgId}`,
//     method: 'get',
//     success: (response) => {
//       $(`.imagPart`).find(`img[src="/proImages/${imgId}"]`).parent().siblings('div').find('button[data-img]').remove();
//       $(`.imagPart`).find(`img[src="/proImages/${imgId}"]`).parent().remove();
//       $(`.imagPart`).load(`/admin/dashboard/product/edit-product #productImages`);
//     }
//   });
// }

// function productImagDelete(productId, imgId) {
//   $.ajax({
//     url: `/admin/dashboard/product/edit-product/delete-img?id=${productId}&img=${imgId}`,
//     method: 'get',
//     success: (response) => {
//       $(`.deleteImg${productId}`).parent().remove();
//       $(`.removebtn${imgId}`).remove();
//       alert('Image deleted successfully');
//     }
//   });
// }

function bannerStatusAction(bannerId, status) {
  $.ajax({
    url: `/admin/dashboard/banner/action?id=${bannerId}&status=${status}`,
    method: 'get',
    success: () => {
      $(`.statusss${bannerId}-${status}`).load(`/admin/dashboard/banner .statusss${bannerId}-${status}`);
      $(`.statuss${bannerId}`).load(`/admin/dashboard/banner .statuss${bannerId}`);
      $(`.status${bannerId}`).load(`/admin/dashboard/banner .status${bannerId}`);
    }
  });
}

// function imgDelete(bannerId,imgId){
//   $.ajax({
//     url:`/admin/dashboard/banner/edit-banner/delete-img?id=${bannerId}&img=${imgId}`,
//     method: 'get',
//     success: (response)=>{
//       $(`.deleteImg${bannerId}`).load(`/admin/dashboard/banner/edit-banner${bannerId} .deleteImg${bannerId}`);
//       alert('sssss')
//     }
//   })
// }

// function imgDelete(bannerId, imgId) {
//   $.ajax({
//     url: `/admin/dashboard/banner/edit-banner/delete-img?id=${bannerId}&img=${imgId}`,
//     method: 'get',
//     success: (response) => {
//       $(`.deleteImg${bannerId}`).filter(function () {
//         return $(this).find('img').attr('src') === `/proImages/${imgId}`;
//       }).remove();
//       alert('Image deleted successfully');
//     }
//   });
// }


// function imgDelete(bannerId, imgId) {
//   $.ajax({
//     url: `/admin/dashboard/banner/edit-banner/delete-img?id=${bannerId}&img=${imgId}`,
//     method: 'get',
//     success: (response) => {
//       $(`.deleteImg${bannerId}`).find(`img[src="/proImages/${imgId}"]`).remove();
//       $(`button[data-img="${imgId}"]`).remove();
//       alert('Image deleted successfully');
//     }
//   });
// }


// function imgDelete(bannerId, imgId) {
//   $.ajax({
//     url: `/admin/dashboard/banner/edit-banner/delete-img?id=${bannerId}&img=${imgId}`,
//     method: 'get',
//     success: (response) => {
//       $(`.deleteImg${bannerId}`).find(`img[src="/proImages/${imgId}"]`).parent().siblings('div').find('button[data-img]').remove();
//       $(`.deleteImg${bannerId}`).find(`img[src="/proImages/${imgId}"]`).parent().remove();
//       $(`.removebtn${imgId}`).load(`/admin/dashboard/banner/edit-banner${bannerId} .removebtn${imgId}`);

//       alert('Image deleted successfully');
//     }
//   });
// }

function imgDelete(bannerId, imgId) {
  $.ajax({
    url: `/admin/dashboard/banner/edit-banner/delete-img?id=${bannerId}&img=${imgId}`,
    method: 'get',
    success: (response) => {
      $(`.deleteImg${bannerId}`).find(`img[src="/proImages/${imgId}"]`).parent().siblings('div').find('button[data-img]').remove();
      $(`.deleteImg${bannerId}`).find(`img[src="/proImages/${imgId}"]`).parent().remove();
      $(`.imagPart`).load(`/admin/dashboard/banner/edit-banner${bannerId} .imagPart`);

      // alert('Image deleted successfully');
    }
  });
}

// function productimgDelete(prodcutId, imgId) {
//   $.ajax({
//     url: `/admin/dashboard/product/edit-product/delete-img?id=${productId}&img=${imgId}`,
//     method: 'get',
//     success: (response) => {
//       $(`.deleteImg${prodcutId}`).find(`img[src="/proImages/${imgId}"]`).parent().siblings('div').find('button[data-img]').remove();
//       $(`.deleteImg${prodcutId}`).find(`img[src="/proImages/${imgId}"]`).parent().remove();
//       $(`.imagPart`).load(`/admin/dashboard/banner/edit-banner${prodcutId} .imagPart`);

//       alert('Image deleted successfully');
//     }
//   });
// }