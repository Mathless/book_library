const request = require("supertest");
const server = require("./server");
const fs = require("fs");
const uuid = require("uuid");

const options = {};

options["key"] = fs.readFileSync("key.pem");
options["cert"] = fs.readFileSync("cert.pem");

describe("Functions test", () => {
  it("should test that true === true", () => {
    expect(true).toBe(true);
  });
});
describe("Post Endpoints", () => {
  it("auth", async () => {
    const res = await request(server).post("/new-api/auth").trustLocalhost().send({
      email: "user1@gmail.com",
      password: "123",
    });
    expect(res.statusCode).toEqual(200);
    expect(JSON.parse(res.text)).toHaveProperty("userId");
  });

  it("register", async () => {
    const res = await request(server)
      .post("/new-api/register")
      .trustLocalhost()
      .send({
        picture: "https://picsum.photos/id/237/200/300",
        email: `${uuid.v4()}user100@gmail.com`,
        password: "123",
        nickname: "Артем Я",
        birth: "2000-06-21",
      });
    expect(res.statusCode).toEqual(200);
    expect(JSON.parse(res.text)).toHaveProperty("userId");
  });
});
//
//   it("should fetch a single post", async () => {
//     const postId = 1;
//     const res = await request(server).get(`/api/posts/${postId}`);
//     expect(res.statusCode).toEqual(200);
//     expect(res.body).toHaveProperty("post");
//   });
//
//   it("should fetch all posts", async () => {
//     const res = await request(server).get("/api/posts");
//     expect(res.statusCode).toEqual(200);
//     expect(res.body).toHaveProperty("posts");
//     expect(res.body.posts).toHaveLength(1);
//   });
//
//   it("should update a post", async () => {
//     const res = await request(server).put("/api/posts/1").send({
//       userId: 1,
//       title: "updated title",
//       content: "Lorem ipsum",
//     });
//
//     expect(res.statusCode).toEqual(200);
//     expect(res.body).toHaveProperty("post");
//     expect(res.body.post).toHaveProperty("title", "updated title");
//   });
//
//   it("should return status code 500 if db constraint is violated", async () => {
//     const res = await request(server).post("/api/posts").send({
//       title: "test is cool",
//       content: "Lorem ipsum",
//     });
//     expect(res.statusCode).toEqual(500);
//     expect(res.body).toHaveProperty("error");
//   });
//
//   it("should delete a post", async () => {
//     const res = await request(server).delete("/api/posts/1");
//     expect(res.statusCode).toEqual(204);
//   });
//
//   it("should respond with status code 404 if resource is not found", async () => {
//     const postId = 1;
//     const res = await request(server).get(`/api/posts/${postId}`);
//     expect(res.statusCode).toEqual(404);
//   });
// });
