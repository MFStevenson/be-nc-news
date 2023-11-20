const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const endpointsJSON = require("../endpoints.json");
require("jest-sorted");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("nc-news", () => {
  test("GET 404: returns 404 given wrong path", () => {
    return request(app)
      .get("/api/not-a-path")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("path not found");
      });
  });

  describe("GET /api/topics", () => {
    test("GET 200: returns all of the topics", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          const { topics } = body;
          expect(topics.length).toBe(3);
          topics.forEach((topic) => {
            expect(typeof topic.slug).toBe("string");
            expect(typeof topic.description).toBe("string");
          });
        });
    });
  });

  describe("GET /api", () => {
    test("GET 200: returns json object listing all endpoints with information about them", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          expect(body.endpoints).toMatchObject(endpointsJSON);
        });
    });
  });

  describe("GET /api/articles/:article_id", () => {
    test("GET 200: returns specific article when given valid id", () => {
      const expectedArticle = {
        article_id: 1,
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: "2020-07-09T21:11:00.000Z",
        votes: 100,
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      };
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toEqual(expectedArticle);
        });
    });

    test("GET 404: returns message saying id not found when id number is non-existant", () => {
      return request(app)
        .get("/api/articles/1000")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("article at id not found");
        });
    });

    test("GET 400: returns error message when invalid id is given", () => {
      return request(app)
        .get("/api/articles/pie")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Something wrong with input");
        });
    });
  });

  describe("GET /api/articles/:article_id/comments", () => {
    test("GET 200: returns comments about the given article", () => {
      const expectedOutput = [
        {
          comment_id: 16,
          body: "This is a bad article name",
          votes: 1,
          author: "butter_bridge",
          article_id: 6,
          created_at: "2020-10-11T16:23:00.000Z",
        },
      ];

      return request(app)
        .get("/api/articles/6/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toEqual(expectedOutput);
        });
    });

    test("GET 200: returns comments about a given article with the most recent comments first", () => {
      const expectedOutput = [
        {
          comment_id: 10,
          body: "git push origin master",
          votes: 0,
          author: "icellusedkars",
          article_id: 3,
          created_at: "2020-06-20T08:24:00.000Z",
        },
        {
          comment_id: 11,
          body: "Ambidextrous marsupial",
          votes: 0,
          author: "icellusedkars",
          article_id: 3,
          created_at: "2020-09-20T00:10:00.000Z",
        },
      ];

      return request(app)
        .get("/api/articles/3/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toEqual(expectedOutput);
          expect(comments).toBeSortedBy("created_at");
        });
    });

    test("GET 404: returnserror message when article_id given has no comments as id does not exist", () => {
      return request(app)
        .get("/api/articles/1000/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("no comments found at id given");
        });
    });

    test("GET 404: returns error message when article_id given has no commentst", () => {
      return request(app)
        .get("/api/articles/2/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("no comments found at id given");
        });
    });

    test("GET 400: returns error message saying something wrong with input when article_id could not be correctly interpreted", () => {
      return request(app)
        .get("/api/articles/hello/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Something wrong with input");
        });
    });
  });
});
