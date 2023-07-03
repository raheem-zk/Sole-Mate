
function addTowoshlist(productId){
    $.ajax({
        url:`/add-wishlist/${productId}`,
        method:'get',
        success:(response)=>{
            // alert('skl')
            if (response == '/login'){
                window.location.href = '/login';
            }else{
            console.log(response);
            }
        }
    })
}
function addBannerProductTowoshlist(productId){
    $.ajax({
        url:`/add-wishlist-bannerproduct/${productId}`,
        method:'get',
        success:(response)=>{
            // alert('skl')
            if (response == '/login'){
                window.location.href = '/login';
            }else{
            console.log(response);
            }
        }
    })
}

function remonWishlistItem(productId,index){
    $.ajax({
        url:`/wihshlist/remove/${productId}`,
        method:"get",
        success:(response)=>{
            $(`.rowToRemove${productId}`).remove();
        }
    })
}

function remonWishlistBannerItem(productId,index){
    $.ajax({
        url:`/wihshlist/remove-banner/${productId}`,
        method:"get",
        success:(response)=>{
            $(`.rowToRemove${productId}`).remove();
        }
    })
}
