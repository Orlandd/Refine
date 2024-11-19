const crypto = require("crypto");
const predictClassification = require("../Service/inferenceService");
const storeData = require("../Service/storeData");


async function postPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;

  const imageSize = Buffer.byteLength(image, "base64");

  console.log(imageSize);

  if (imageSize > 1000000) {
    const response = h.response({
      status: "fail",
      message: "Payload content length greater than maximum allowed: 1000000",
    });
    response.code(413);
    return response;
  }
  // console.log(model);

  const { label } = await predictClassification(model, image);

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const data = {
    id,
    result: label,
    createdAt,
  };

  const response = h.response({
    status: "success",
    message: "Model is predicted successfully",
    data,
  });
  response.code(201);

  console.log("tets")
  await storeData()
  console.log("tetssss")

  return response;
}

module.exports = postPredictHandler;
