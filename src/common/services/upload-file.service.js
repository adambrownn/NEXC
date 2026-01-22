const {
  getFileExtensionAndMimeTypeFromBuffer,
  getFileTypeFromFileExtension,
  getS3Path,
} = require("./utility.service");
const { v4: uuidv4 } = require("uuid");
const { uploadFileToS3 } = require("./archive/s3-storage.service");

/**
 *
 * @param {fileToUpload, userId/restaurantId/dishId/referenceId, fileCategory} req
 * @param {originalFileUri} res
 */
module.exports.uploadFile = async (req, res) => {
  try {
    if (!req.files) {
      throw new Error("Select atlease one file");
    }

    const file = req.files.fileToUpload;

    let referenceId = "";
    switch (req.body.fileCategory) {
      case "user":
        referenceId = req.user.userId;
        break;
      case "restaurant":
        referenceId = req.body.restaurantId;
        break;
      case "dish":
        referenceId = `${req.body.restaurantId}/dishes`;
        break;
      case "shared":
        referenceId = req.body.referenceId;
        break;
      default:
        throw new Error("Invalid file category");
    }

    // check file size --------

    // check file media type
    const { fileExtension, mimeType } =
      await getFileExtensionAndMimeTypeFromBuffer(file.data);

    //for now we are only supporting images
    const fileType = await getFileTypeFromFileExtension(fileExtension);
    if (!fileType) {
      throw new Error(`Invalid file format- ${fileExtension}`);
    }

    //original file upload
    // upload compressed file (thumbnail) ------------------

    file.mimeType = mimeType;

    //generate unique file name for file
    let originalVersionFileName;
    switch (req.body.fileSubCategory) {
      case "profileimage":
        originalVersionFileName = "profilepic_original";
        break;

      case "coverimage":
        originalVersionFileName = "coverpic_original";
        break;

      case "dishimage":
        originalVersionFileName = req.body.dishId + "_original";
        break;

      default:
        originalVersionFileName =
          uuidv4().toString().replace(/-/g, "") + "_original";
        break;
    }

    const s3FilePath = await getS3Path(req.body.fileCategory, referenceId);
    const originalFileS3Path = `${s3FilePath}${originalVersionFileName}.${fileExtension}`;

    // upload to s3
    const originalFileUri = await uploadFileToS3(file, originalFileS3Path);

    res.json({
      originalFileUri,
    });
  } catch (error) {
    res.json({ err: error.message });
  }
};
