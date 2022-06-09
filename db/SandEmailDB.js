// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// dotenv.config();

// function sendEmail(email, subject, body) {
//     const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//             user: process.env.Email_PF,
//             pass: process.env.Password_PF
//         }
//     });

//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: subject,
//         html: `
//         <h1>Codigo de Verificación</h1>
//         <p>${body}</p>
//         <p>Gracias por registrarte en nuestra aplicación</p>
//         <p>Saludos!</p>
//         <p>Esto es una respuesta automatica!</p>
//         `
//     }

//     transporter.sendMail(mailOptions, function (error, info) {
//         if (error) {
//             console.log(error);
//         } else {
//             console.log("Email sent: " + info.response);
//         }
//     });
// }

// export default { sendEmail };