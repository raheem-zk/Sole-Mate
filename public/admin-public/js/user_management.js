
function userBlock(userId, status) {
    $.ajax({
      url: `/admin/dashboard/user/action?id=${userId}&status=${status}`,
      method: 'get',
      success: () => {
        $(`.statuss${userId}`).load(`/admin/dashboard/user .statuss${userId}`);
        $(`.status${userId}`).load(`/admin/dashboard/user .status${userId}`);
      },
    });
  }
  