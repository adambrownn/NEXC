const FileType = require("file-type");

// only these file extensions are allowed to upload
const imageExtensions = ["png", "jpeg", "jpg"];

module.exports.getFileExtensionAndMimeTypeFromBuffer = async (dataBuffer) => {
  const fileData = await FileType.fromBuffer(dataBuffer);
  return { fileExtension: fileData.ext, mimeType: fileData.mime };
};

module.exports.getFileTypeFromFileExtension = async (fileExtension) => {
  if (imageExtensions.indexOf(fileExtension.toLowerCase()) >= 0) {
    return "image";
  }
};

module.exports.getS3Path = async (s3FolderName, id) => {
  let s3Path = ""; //base path
  if (s3FolderName === "user") {
    s3Path += `users/${id}/`;
    return s3Path;
  } else if (s3FolderName === "restaurant") {
    s3Path += `restaurants/${id}/`;
    return s3Path;
  } else if (s3FolderName === "dish") {
    s3Path += `restaurants/${id}/`;
    return s3Path;
  } else if (s3FolderName === "shared") {
    s3Path += `shared/${s3FolderName}/`;
    return s3Path;
  } else {
    return s3Path;
  }
};
