// import { v4 } from "uuid";
// import AWS from "aws-sdk";
// import multer from "multer";
// import multerS3 from "multer-s3";

// const s3 = new AWS.S3({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// });

// const fileFilte = (req, file, cb) => {
//     console.log(file);
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
//         cb(null, true)
//     } else {
//         cb(null, false)
//     }
// }

// const uploadS3Profile = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: `${process.env.AWS_BUCKET_NAME}/${process.env.FOLDER_USER}`,
//         acl: 'public-read',
//         contentType: multerS3.AUTO_CONTENT_TYPE,
//         metadata: function (req, file, cb) {
//             console.log(file);
//             cb(null, { fieldName: file.fieldname });
//         },
//         key: function (req, file, cb) {
//             cb(null, nameFile(file.originalname));
//         },
//     }),
//     fileFilter: fileFilte
// })

// const uploadS3Groups = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: `${process.env.AWS_BUCKET_NAME}/${process.env.FOLDER_GROUP}`,
//         acl: 'public-read',
//         contentType: multerS3.AUTO_CONTENT_TYPE,
//         metadata: function (req, file, cb) {
//             console.log(file);
//             cb(null, { fieldName: file.fieldname });
//         },
//         key: function (req, file, cb) {
//             cb(null, nameFile(file.originalname));
//         },
//     }),
//     fileFilter: fileFilte
// })

// function nameFile(name) {
//     const myFile = name.split(".");
//     const fileType = myFile[myFile.length - 1];
//     const fileName = `${v4()}.${fileType}`;
//     return fileName;
// }

// const deleteS3Profile = (name) => {
//     s3.deleteObject({
//         Bucket: `${process.env.AWS_BUCKET_NAME}/${process.env.FOLDER_USER}`,
//         Key: name
//     }, (err, data) => {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log(data);
//         }
//     });
// }

// const deleteS3Group = (name) => {
//     s3.deleteObject({
//         Bucket: `${process.env.AWS_BUCKET_NAME}/${process.env.FOLDER_GROUP}`,
//         Key: name
//     }, (err, data) => {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log(data);
//         }
//     });
// }

// export default { uploadS3Profile, uploadS3Groups, deleteS3Profile, deleteS3Group };