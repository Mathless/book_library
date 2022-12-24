$(document).ready(() => {
  $(`#all-users`).click(function () {
    console.log("click");
    window.location.href = "https://localhost:3000/users";
  });
  const userId = localStorage["id"];

  $.get(`https://localhost:3000/api/news-for-user/${userId}`).done((data) => {
    data?.news?.forEach((block, i) => {
      console.log(block);
      $("#accordion").append(`
             <h3> ${block.title} - ${block.user.name}

            </h3>
            <div>
              <p>
                ${block.text}
              </p>
            </div>
          `);
    });
    $(function () {
      $("#accordion").accordion();
    });
    console.log(data);
    $("#user-name").text(` ${data.user.name}`);
  });
});
