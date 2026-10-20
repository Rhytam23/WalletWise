// Builds a base64 data URI from an uploaded file (multer memory storage) for
// Cloudinary. Done natively instead of with the `datauri` package, which pulled
// in a vulnerable image-size version.
const getDataUri = (file) => ({
    content: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
});

module.exports = getDataUri;
