

function remove(addressId){
    $.ajax({
        url:`/profile/manage-address/remove/${addressId}`,
        method:'get',
        success: (response)=>{
            alert('remove');
        }
    })
}