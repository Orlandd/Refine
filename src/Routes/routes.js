const postPredictHandler = require("./handler");

const routes = [
  {
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return "Hello World!";
    },
  },
  {
    path: "/predict",
    method: "POST",
    handler: postPredictHandler,
    options: {
      payload: {
        allow: "multipart/form-data",
        multipart: true,
        maxBytes: 1000000,
      },
    },
  },
];

module.exports = routes;
