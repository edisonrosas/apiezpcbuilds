const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

exports.sendVerificationEmail = (data) => {
  const { email, _id, username } = data;

  const token = jwt.sign(
    {
      email,
      _id,
    },
    process.env.JWT_KEY,
    {
      expiresIn: "30m",
    }
  );
  console.log("toekn",token)
  // config for mailserver and mail, input your data
  const config = {
    mailserver: {
      service: 'gmail',
      //host: "smtp.gmail.com",
     // port: 465,
      secure: true,
      secureConnection: true,
      auth: {
        type: 'OAuth2',
        user: process.env.EMAILUSER,
       // pass:  process.env.EMAILPASS,
        clientId: process.env.CLIENTID,//"475359444920-vv0206n1nl8241adbj3olbbqbouh8frm.apps.googleusercontent.com",
        clientSecret: process.env.CLIENTSECRET,//"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",
        refreshToken: process.env.REFRESHTOKEN,//"1//04GSxfe3RwnbLCgYIARAAGAQSNwF-L9IrAtGSQGzpZVK1p751ovSjGdDVSesyS4te-lBQyu9s8euk-r8_7GfDmMnFSKjkYhLz9L8",
        accessToken: process.env.ACCESSTOKEN,//"ya29.A0ARrdaM-emSNkimQI7UsIUSdpyxR0ZZSL25U_D0Nwl8k19BoruavC91jk7EInZpppswqjiNbkOEDRMtaAuxMgifTv6y2PvRjKu35H-NNkDGFMZ2iABlim4i_obdQljDcp0vOWAjcFpm0IrutjRavRAsewnzdcYUNnWUtBVEFTQVRBU0ZRRl91NjFWa3RBSTMyY0tSeElrZW81bTVYMlFLdw0163",
        expires: 1484314697598,
      }
    },
    mail: {
      from: process.env.EMAILUSER,
      to: email,
      subject: "Verificación de Email",
      template: "emailVerify",
      context: {
        token,
        username,
        host: process.env.HOST,
      },
    },
  };

  const sendMail = async ({ mailserver, mail }) => {
    // create a nodemailer transporter using smtp
    let transporter = nodemailer.createTransport(mailserver);

    transporter.use(
      "compile",
      hbs({
        viewEngine: {
          partialsDir: "./emailViews/",
          defaultLayout: "",
        },
        viewPath: "./emailViews/",
        extName: ".hbs",
      })
    );

    // send mail using transporter
    await transporter.sendMail(mail);
  };

  sendMail(config).catch((err) => console.log(err));
};

exports.sendPasswordResetEmail = (data) => {
  console.log(process.env.EMAILUSER);
  const { email, _id, username } = data;
  console.log("enviando email");
  const token = jwt.sign(
    {
      email,
      _id,
    },
    process.env.JWT_KEY,
    {
      expiresIn: "10m",
    }
  );

  // config for mailserver and mail, input your data
  const config = {
   
   /* mailserver: {
     // service: "gmail",
     // service: 'gmail',//also tried host:'smtp.gmail.com'
      
     
    // secure: true, //also tried 'true'
    //  port: 465,            
    //  host: "smtp.gmail.com",
    
      host: 'imap.ethereal.email',

      port: 993,
     // security: "TLS",
      auth: {
        user:	"eileen.hettinger17@ethereal.email",//process.env.EMAILUSER,
        pass: "MshduuE4VdKD6HqGGY" // process.env.EMAILPASS,
      },
    },*/
    mailserver: {
      service: 'gmail',
      //host: "smtp.gmail.com",
     // port: 465,
      secure: true,
      secureConnection: true,
      auth: {
        type: 'OAuth2',
        user: process.env.EMAILUSER,
       // pass:  process.env.EMAILPASS,
        clientId: process.env.CLIENTID,//"475359444920-vv0206n1nl8241adbj3olbbqbouh8frm.apps.googleusercontent.com",
        clientSecret: process.env.CLIENTSECRET,//"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",
        refreshToken: process.env.REFRESHTOKEN,//"1//04GSxfe3RwnbLCgYIARAAGAQSNwF-L9IrAtGSQGzpZVK1p751ovSjGdDVSesyS4te-lBQyu9s8euk-r8_7GfDmMnFSKjkYhLz9L8",
        accessToken: process.env.ACCESSTOKEN,//"ya29.A0ARrdaM-emSNkimQI7UsIUSdpyxR0ZZSL25U_D0Nwl8k19BoruavC91jk7EInZpppswqjiNbkOEDRMtaAuxMgifTv6y2PvRjKu35H-NNkDGFMZ2iABlim4i_obdQljDcp0vOWAjcFpm0IrutjRavRAsewnzdcYUNnWUtBVEFTQVRBU0ZRRl91NjFWa3RBSTMyY0tSeElrZW81bTVYMlFLdw0163",
        expires: 1484314697598,
      }
    },

    mail: {
      from: process.env.EMAILUSER,
      to: email,
      subject: "Reestablecer contraseña",
      template: "passwordReset",
      context: {
        token,
        username,
        host: process.env.HOSTFRONT,
      },
    },
  };
  console.log(email)
  const sendMail = async ({ mailserver, mail }) => {
    // create a nodemailer transporter using smtp
    let transporter = nodemailer.createTransport(mailserver);

    transporter.use(
      "compile",
      hbs({
        viewEngine: {
          partialsDir: "./emailViews/",
          defaultLayout: "",
        },
        viewPath: "./emailViews/",
        extName: ".hbs",
      })
    );

    // send mail using transporter
    await transporter.sendMail(mail);
  };

  sendMail(config).catch((err) => console.log(err));
};
