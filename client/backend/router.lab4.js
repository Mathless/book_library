const session = require("express-session");
const uuid = require("uuid");
module.exports = function (app, io) {
  const express = require("express");
  const fs = require("fs");
  const _ = require("lodash");
  const uuid = require("uuid");
  const session = require("express-session");
  const dotenv = require("dotenv").config({ path: "../.env" });

  function getJson(fileName) {
    const rawdata = fs.readFileSync(fileName);
    return JSON.parse(rawdata);
  }

  function saveObjectAsJson(object, name) {
    fs.writeFile(name, JSON.stringify({ [name.slice(0, -5)]: object }), (error) => {
      if (error) throw error;
    });
  }

  let users = getJson("users.json")?.users;
  let news = getJson("news.json")?.news;
  let messages = getJson("messages.json").messages;
  let userSockets = {};
  const sessionMiddleware = session({
    secret: "SAADKJLKSadl",
    saveUninitialized: true,
    cookie: {
      secure: true,
    },
  });
  app.use(sessionMiddleware);

  function checkLoginAndPassword(req) {
    const user = users.filter((user) => req.body.email === user.email && req.body.password === user.password);
    return user.length > 0;
  }

  function getUserIdByEmail(email) {
    const user = users.filter((user) => user.email === email);
    if (user.length > 0) {
      return user[0].id;
    } else {
      return null;
    }
  }
  const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);

  io.use(wrap(sessionMiddleware));
  // only allow authenticated users
  io.use((socket, next) => {
    console.log(socket);
    const session = socket.request.session;
    console.log(session);

    if (session && session.loggedIn) {
      next();
    } else {
      next(new Error("unauthorized"));
    }
  });
  function sendNews(userId, news) {
    const user = users.filter((user) => user.id === userId);
    if (user.length === 0) return;
    const friends = user[0].friends;
    for (const friend of friends) {
      io.to(userSockets[friend]).emit("news", { user_id: user.id, title: news.title, text: news.text });
    }
  }
  function sendMessages(userId, friendId, message) {
    io.to(userSockets[userId]).emit("message", { text: message, id: uuid.v4(), from: userId, to: friendId });
    if (userId !== friendId) {
      io.to(userSockets[friendId]).emit("message", { text: message, id: uuid.v4(), from: userId, to: friendId });
    }
  }
  io.on("connection", (socket) => {
    userSockets[socket.request.session.userId] = socket.id;
    // sendMessages(socket.request.session.userId, socket.request.session.userId, "123 ");

    // При подключении клиента
    socket.on("conn", (msg) => {
      // Сообщение "conn"
      console.log("123");
      let time = new Date().toLocaleTimeString();
      socket.name = msg.name; // Сохранение имени
      socket.emit("msg", {
        message: `${time} Привет ${socket.name}!`,
      });
      socket.broadcast.emit("msg", {
        message: `${time} Вошёл ${socket.name}!`,
      });
    });
    socket.on("message", (msg) => {
      // Сообщение "msg"
      let time = new Date().toLocaleTimeString();
      msg = `${time} ${socket.name}: ${msg.value}`; // Сообщение
      socket.emit("msg", { message: msg }); // Отправка "обратно"
      socket.broadcast.emit("msg", { message: msg }); /* Отправка
всем */
    });
  });

  app.post("/new-api/auth", (req, res, next) => {
    users = getJson("users.json")?.users;
    news = getJson("news.json")?.news;
    if (checkLoginAndPassword(req)) {
      req.session.loggedIn = true;
      req.session.userId = getUserIdByEmail(req.body.email);
      res.send(JSON.stringify({ userId: req.session.userId }));
    } else {
      res.sendStatus(401);
    }
  });
  app.get("/new-api/test", (req, res) => {
    // users = getJson("users.json")?.users;
    // news = getJson("news.json")?.news;
    res.send({ test: "ok" });
    res.end();

    res.send({ test: "ok" });

    if (!req.session.loggedIn) {
      res.sendStatus(401);
    }
    res.send({ test: "ok" });
  });

  app.get("/new-api/logout", (req, res) => {
    users = getJson("users.json")?.users;
    news = getJson("news.json")?.news;
    req.session.destroy((err) => {});
    res.send("Thank you! Visit again");
  });

  app.post("/new-api/register", (req, res, next) => {
    users = getJson("users.json")?.users;
    news = getJson("news.json")?.news;
    const body = req.body;
    if (
      body === undefined ||
      !body.picture ||
      !body.email ||
      !body.password ||
      !body.nickname ||
      !body.birth ||
      users.filter((user) => user.email === body.email).length > 0
    ) {
      res.status(400);
      res.json({ message: "Bad Request" });
    } else {
      const user = {
        id: uuid.v4(),
        photo: body.picture,
        name: body.nickname,
        birth: body.birth,
        email: body.email,
        password: body.password,
        role: "Пользователь",
        status: "Активный",
        friends: [],
      };

      users.push(user);
      saveObjectAsJson(users, "users.json");
      res.status(200);
      res.send({ userId: user.id });
    }
  });

  function getUsersWithoutPasswords() {
    return users.map((user) => {
      const userToSend = _.cloneDeep(user);
      delete userToSend.password;
      return userToSend;
    });
  }

  app.get("/new-api/users", (req, res, next) => {
    users = getJson("users.json")?.users;
    news = getJson("news.json")?.news;
    if (!req.session.loggedIn) {
      res.sendStatus(401);
    } else {
      res.json(getUsersWithoutPasswords());
    }
  });

  app.post("/new-api/add-friend", (req, res, next) => {
    users = getJson("users.json")?.users;
    news = getJson("news.json")?.news;
    if (!req.session.loggedIn) {
      res.sendStatus(401);
    } else {
      const body = req.body;
      if (body === undefined || !body.friendId || users.filter((user) => user.id === body.friendId).length === 0) {
        res.status(400);
        res.json({ message: "Bad Request" });
      } else {
        const friend = users.filter((user) => user.id === body.friendId)[0];
        const user = users.filter((user) => user.id === req.session.userId)[0];
        friend.friends.push(req.session.userId);
        user.friends.push(body.friendId);
        saveObjectAsJson(users, "users.json");
        res.json({ res: "Ok" });
      }
    }
  });

  app.post("/new-api/delete-friend", (req, res, next) => {
    users = getJson("users.json")?.users;
    news = getJson("news.json")?.news;
    if (!req.session.loggedIn) {
      res.sendStatus(401);
    } else {
      const body = req.body;
      if (body === undefined || !body.friendId || users.filter((user) => user.id === body.friendId).length === 0) {
        res.status(400);
        res.json({ message: "Bad Request" });
      } else {
        const friend = users.filter((user) => user.id === body.friendId)[0];
        const user = users.filter((user) => user.id === req.session.userId)[0];
        const indexUser = friend.friends.indexOf(req.session.userId);
        if (indexUser > -1) {
          friend.friends.splice(indexUser, 1);
        }
        const indexFriend = user.friends.indexOf(body.friendId);
        if (indexFriend > -1) {
          user.friends.splice(indexFriend, 1);
        }
        saveObjectAsJson(users, "users.json");
        res.json({ res: "Ok" });
      }
    }
  });
  app.post("/new-api/news", (req, res, next) => {
    users = getJson("users.json")?.users;
    news = getJson("news.json")?.news;
    if (!req.session.loggedIn) {
      res.sendStatus(401);
    } else {
      const body = req.body;
      if (body === undefined || !body.title || !body.text) {
        res.status(400);
        res.json({ message: "Bad Request" });
      } else {
        const newNews = {
          user_id: req.session.userId,
          title: body.title,
          text: body.text,
        };

        news.push(newNews);
        saveObjectAsJson(news, "news.json");
        sendNews(req.session.userId, newNews);
        res.status(200);
        res.send(newNews);
      }
    }
  });

  app.get("/new-api/news", (req, res, next) => {
    users = getJson("users.json")?.users;
    news = getJson("news.json")?.news;
    if (!req.session.loggedIn) {
      res.sendStatus(401);
    } else {
      const loggedUser = users.filter((user) => user.id === req.session.userId)[0];
      res.json(news.filter((val) => loggedUser.friends.includes(val.user_id)));
    }
  });

  app.get("/new-api/role", (req, res, next) => {
    users = getJson("users.json")?.users;
    news = getJson("news.json")?.news;
    if (!req.session.loggedIn) {
      res.sendStatus(401);
    } else {
      const loggedUser = users.filter((user) => user.id === req.session.userId)[0];
      res.json({ role: loggedUser.role });
    }
  });

  app.post("/new-api/get-messages", (req, res, next) => {
    users = getJson("users.json")?.users;
    news = getJson("news.json")?.news;
    if (!req.session.loggedIn) {
      res.sendStatus(401);
    } else {
      const body = req.body;
      if (body === undefined || !body.friendId) {
        res.status(400);
        res.json({ message: "Bad Request" });
      } else {
        res.send(
          messages.filter((x) => {
            return (
              (req.session.userId === x.from && body.friendId === x.to) ||
              (req.session.userId === x.to && body.friendId === x.from)
            );
          })
        );
      }
    }
  });

  app.post("/new-api/message", (req, res, next) => {
    users = getJson("users.json")?.users;
    news = getJson("news.json")?.news;
    if (!req.session.loggedIn) {
      res.sendStatus(401);
    } else {
      const body = req.body;
      if (body === undefined || !body.friendId || !body.text) {
        res.status(400);
        res.json({ message: "Bad Request" });
      } else {
        const newMessage = {
          id: uuid.v4(),
          to: body.friendId,
          from: req.session.userId,
          text: body.text,
        };

        messages.push(newMessage);
        saveObjectAsJson(messages, "messages.json");
        res.status(200);
        res.send(newMessage);
        sendMessages(req.session.userId, body.friendId, body.text);
      }
    }
  });
};
