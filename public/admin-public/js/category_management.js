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
  
  