function categoryAction(categoryId, status) {
    $.ajax({
      url: `/admin/dashboard/category/action?id=${categoryId}&status=${status}`,
      method: 'get',
      success: () => {
        console.log(categoryId, status);
        $(`.status${categoryId}`).load(`/admin/dashboard/category .status${categoryId}`);
        $(`.statusss${categoryId}-${status}`).load(`/admin/dashboard/category .statusss${categoryId}-${status}`);
        $(`.statuss${categoryId}`).load(`/admin/dashboard/category .statuss${categoryId}`);
        // alert('The ')
      }
    });
  }
  
  
  function addCategory(){
    let data = document.getElementById('addcategory').value;

    $.ajax({
      url:'/admin/dashboard/add-category',
      method:'post',
      data: {data},
      success:(response)=>{
        //  added
        $('#dataTable').load('/admin/dashboard/category #dataTable');
      }
    })
  }


  function editCategory(){
    let categoryName = document.getElementById('newCategoryName').value;
    let categoryId = document.getElementById('categoryId').value;
    let data ={
      categoryName,
      categoryId
    }
    $.ajax({
      url:'/admin/dashboard/edit-category',
      method:'post',
      data: {data},
      success:(response)=>{
        alert(response)
        $(`#categoryId`).load(`/admin/dashboard/category #categoryId`);
      }
    })
  }