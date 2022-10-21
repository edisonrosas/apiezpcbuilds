var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


//integracion nueva

const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const socket_io = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config({ path: "variables.env" });
//const functions = require("firebase-functions");

const formidable = require('express-formidable');
//var multipart = require('connect-multiparty');
var bodyParser = require('body-parser')
const busboy = require('connect-busboy');
const cors = require('cors')({
  origin: true,
});



//Conexión a mongo
mongoose.connect("mongodb+srv://redsocial:redsocial123456@redsocialviajes.wgxmo.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on("error", (err) => {
  console.error(err.message);
});

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("autoIndex", false);



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));


//necesario para APIS
app.use(cors);


//Importar modelos
require("./models/Post");
require("./models/User");
require("./models/Comment");
require("./models/CommentReply");
require("./models/CommentReplyLike");
require("./models/CommentLike");
require("./models/PostLike");
require("./models/Following");
require("./models/Followers");
require("./models/Notification");
require("./models/ChatRoom");
require("./models/Message");

const io = socket_io();

//Uso socket io para dar respuestas 
const userController = require("./controllers/userController");

io.use(function(sock, next) {
  var handshakeData = sock.request;
  console.log('_query:', handshakeData._query);
  console.log('extra:', handshakeData.extra);
  next();
});
app.io = io;
/*
io.use((socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    const token = socket.handshake.query.token.split(" ")[1];
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) return next(new Error("Authentication error"));
      socket.userData = decoded;
      next();
      console.log("todo ok1 ")
    });
  } else {
    next(new Error("Authentication error"));
  }
}).on("connection", (socket) => {
  console.log("todo ok2 ")
  // Connection now authenticated to receive further events
  socket.join(socket.userData.userId);
  io.in(socket.userData.userId).clients((err, clients) => {
    userController.changeStatus(socket.userData.userId, clients, io);
    //console.log(clients);
  });
  socket.on("typing", (data) => {
    socket.to(data.userId).emit("typing", { roomId: data.roomId });
  });
  socket.on("stoppedTyping", (data) => {
    socket.to(data.userId).emit("stoppedTyping", { roomId: data.roomId });
  });
  socket.on("disconnect", () => {
    socket.leave(socket.userData.userId);
    io.in(socket.userData.userId).clients((err, clients) => {
      userController.changeStatus(socket.userData.userId, clients, io);
      //console.log(clients);
    });
  });
});*/

app.set("socketio", io);


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
});

const postsRouter = require("./routes/post");
const usersRouter = require("./routes/user");
const commentsRouter = require("./routes/comment");
const notificationRouter = require("./routes/notification");
const chatRouter = require("./routes/chat");




app.use(helmet());
if (process.env.NODE_ENV === "production") {
  app.use(limiter);
  app.use(
    logger("common", {
      stream: fs.createWriteStream("./access.log", { flags: "a" }),
    })
  );
} else {
  app.use(logger("dev"));
}


app.use("/api/user/", usersRouter);
app.use("/api/comment/", commentsRouter);
app.use("/api/notification/", notificationRouter);
app.use("/api/chat/", chatRouter);

//app.use(busboy());
app.use("/api/post/", postsRouter);

app.get("/auth/reset/password/:jwt", function (req, res) {
  return res.status(404).json({ message: "go to port 3000" });
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  //res.locals.message = err.message;
  //res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
    },
  });

  //res.render('error');
});

module.exports = app;
