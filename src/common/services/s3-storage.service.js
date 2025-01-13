const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_S3_REGION,
});
var s3 = new AWS.S3();

module.exports.uploadFileToS3 = async (file, s3Path) => {
  const params = {
    Body: file.data,
    Bucket: process.env.AWS_S3_BUCKET,
    Key: s3Path,
    ContentType: file.mimeType,
    //ACL: "public-read",
  };

  const { Location } = await s3.upload(params).promise();
  return Location;
};
