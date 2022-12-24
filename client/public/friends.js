function editUserRequest(body) {
  const url = "https://localhost:3000/api/edit-user";
  $.ajax({
    type: "PUT",
    url: url,
    data: JSON.stringify(body),
    traditional: true,
    contentType: "application/json; charset=utf-8",
  });
}
function shofModal(user) {
  // console.log(JSON.stringify(user))

  $(`#photo`).val(user.photo);
  $(`#name`).val(user.name);
  document.getElementById("birth").valueAsDate = new Date(user.birth);
  $(`#email`).val(user.email);
  $("#submitButton").click(function () {
    body = {};
    body.id = user.id;
    body.photo = $(`#photo`).val();
    body.name = $(`#name`).val();
    body.birth = $(`#birth`).val();
    body.email = $(`#email`).val();
    editUserRequest(body);
  });
  $(`#editUserInfo`).show();
}

function changeUserRole(id, role) {
  const url = "https://localhost:3000/api/change-role";
  body = {
    id: id,
    role: role,
  };

  $.ajax({
    type: "POST",
    url: url,
    data: JSON.stringify(body),
    traditional: true,
    contentType: "application/json; charset=utf-8",
  });
}
function changeUserStatus(id, status) {
  const url = "https://localhost:3000/api/change-status";
  body = {
    id: id,
    status: status,
  };

  $.ajax({
    type: "POST",
    url: url,
    data: JSON.stringify(body),
    traditional: true,
    contentType: "application/json; charset=utf-8",
  });
}
$(document).ready(() => {
  $(`#all-users`).click(function () {
    console.log("click");
    window.location.href = "https://localhost:3000/users";
  });
  const userId = localStorage["id"];
  $.get(`https://localhost:3000/api/users/${userId}`).done((data) => {
    data?.users?.forEach((user, i) => {
      console.log(data);
      $("#users-table > tbody:last-child").append(`<tr>
              <td><img src="${user.photo}" alt="Avatar" width="32" height="32" style="border-radius: 50%" </td>
              <td>${user.name}</td>
              <td>${user.birth}</td>
              <td>${user.email}</td>
              <td>
                <select id="select-${i}-role"style="border: 1px solid #D9D9D9;border-radius: 2px; background: #ffffff">
                  <option value="Администратор" ${
                    user.role === "Администратор" ? `selected="selected"` : ""
                  }>Администратор</option>
                  <option value="Пользователь" ${
                    user.role === "Пользователь" ? `selected="selected"` : ""
                  }>Пользователь</option>
                </select>
              </td>
              <td>
                <select id="select-${i}-status"style="border: 1px solid #D9D9D9;border-radius: 2px; background: #ffffff">
                  <option value="Не подтверждённый пользователь" ${
                    user.status === "Не подтверждённый пользователь" ? `selected="selected"` : ""
                  }>Не подтверждённый пользователь</option>
                  <option value="Активный" ${user.status === "Активный" ? `selected="selected"` : ""}>Активный</option>
                  <option value="Заблокированный" ${
                    user.status === "Заблокированный" ? `selected="selected"` : ""
                  }>Заблокированный</option>
                </select>
              </td>
              <td>
              <button class="link" id="edit-user-${i}"">Редактировать</button>
              <button class="link" id="friends-user-${i}">Друзья</button>
              <button class="link" id="news-user-${i}">Новости</button>
              </td>

              </tr>`);
      $(`#edit-user-${i}`).click(function () {
        shofModal(user);
      });
      $(`#news-user-${i}`).click(function () {
        localStorage.setItem("id", user.id);
        window.location.href = "https://localhost:3000/news";
      });
      $(`#friends-user-${i}`).click(function () {
        localStorage.setItem("id", user.id);
        window.location.href = "https://localhost:3000/friends";
      });
      $(`#select-${i}-role`).change(function () {
        changeUserRole(user.id, $(this).val());
      });
      $(`#select-${i}-status`).change(function () {
        changeUserStatus(user.id, $(this).val());
      });
    });
    $("#user-name").text(` ${data.user.name}`);
  });
});
