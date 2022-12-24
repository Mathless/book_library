const express = require("express");
const router = express.Router();
const fs = require("fs");
const _ = require("lodash");

function getJson(fileName) {
  const rawdata = fs.readFileSync(fileName);
  return JSON.parse(rawdata);
}
function saveObjectAsJson(object, name) {
  fs.writeFile(name, JSON.stringify(object), (error) => {
    if (error) throw error;
  });
}

const users = getJson("users.json");
const news = getJson("news.json");

router.get("/users", (req, res) => {
  res.render("users");
});

router.get("/friends", (req, res) => {
  res.render("friends");
});

router.get("/news", (req, res) => {
  res.render("news");
});

router.get("/api/users", (req, res, next) => {
  res.send(users);
  next();
});

router.get("/api/users/:id", (req, res, next) => {
  let user = users.users.filter((val) => val.id === req.params.id);

  if (user.length === 0) {
    res.status(404);
    res.json({ message: "There is not user with this id" });
  } else {
    user = user[0];
  }
  res.send({ users: users.users.filter((val) => val.friends.includes(req.params.id)), user: user });
  next();
});

router.get("/api/news-for-user/:id", (req, res) => {
  let user = users.users.filter((val) => val.id === req.params.id);

  if (user.length === 0) {
    res.status(404);
    res.json({ message: "There is not user with this id" });
  } else {
    user = user[0];
  }
  const news_for_user = news.news
    .filter((val) => {
      return val.user_id === req.params.id;
    })
    .map((data) => {
      user_news = users.users.filter((val) => user.friends.includes(val.id));
      if (user_news.length > 0) data.user = user_news[0];
      return data;
    });

  res.send({ news: news_for_user, user: user });
});

router.get("/api/news", (req, res) => {
  res.send(news);
});

router.post("/api/change-role", (req, res, next) => {
  const body = req.body;
  if (body === undefined || !body.id || !body.role || !["Администратор", "Пользователь"].includes(body.role)) {
    res.status(400);
    res.json({ message: "Bad Request" });
  } else {
    const usersArray = users.users.filter((val) => val.id === body.id);
    let user;
    if (usersArray.length > 0) {
      user = usersArray[0];
      user.role = body.role;
    }
    saveObjectAsJson(users, "users.json");
    res.status(200);
    res.send(user);
  }
  next();
});

router.post("/api/change-status", (req, res, next) => {
  const body = req.body;
  if (
    body === undefined ||
    !body.id ||
    !body.status ||
    !["Не подтверждённый пользователь", "Активный", "Заблокированный"].includes(body.status)
  ) {
    res.status(400);
    res.json({ message: "Bad Request" });
  } else {
    const usersArray = users.users.filter((val) => val.id === body.id);
    let user;
    if (usersArray.length > 0) {
      user = usersArray[0];
      user.status = body.status;
    }
    saveObjectAsJson(users, "users.json");
    res.status(200);
    res.send(user);
  }
  next();
});
router.put("/api/edit-user", (req, res, next) => {
  const body = req.body;
  if (body === undefined || !body?.id) {
    res.status(400);
    res.json({ message: "Bad Request" });
  } else {
    const usersArray = users.users.filter((val) => val.id === body.id);
    if (usersArray.length > 0) {
      _.merge(usersArray[0], req.body);
      saveObjectAsJson(users, "users.json");
      res.status(200);
      res.send(usersArray[0]);
    }
  }
});

module.exports = router;
