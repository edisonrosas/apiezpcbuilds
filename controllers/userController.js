const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const Jimp = require("jimp");
const uuidv4 = require("uuid/v4");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const User = mongoose.model("User");
const Post = mongoose.model("Post");
const Following = mongoose.model("Following");
const Followers = mongoose.model("Follower");
const Notification = mongoose.model("Notification");
const ChatRoom = mongoose.model("ChatRoom");
const Message = mongoose.model("Message");
const notificationHandler = require("../handlers/notificationHandler");
const emailHandler = require("../handlers/emailHandler");
const messageHandler = require("../handlers/messageHandler");
const { json } = require("express");

// Check File Type
/*
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Solo imagenes permitidas"));
  }
}

const storage = multer.diskStorage({
  //multers disk storage settings
  destination: (req, file, cb) => {
    cb(null, "./public/images/profile-picture/");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];

    cb(null, uuidv4() + "." + ext);
  },
});

const upload = multer({
  //multer settings
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: {
    fileSize: 1024 * 1024,
  },
}).single("photo");

exports.upload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) return res.json({ message: err.message });

    if (!req.file) return res.json({ message: "Please upload a file" });

    req.body.photo = req.file.filename;

    Jimp.read(req.file.path, function (err, test) {
      if (err) throw err;
      test
        .resize(100, 100)
        .quality(50)
        .write("./public/images/profile-picture/100x100/" + req.body.photo);
      next();
    });
  });
};*/
/*
function deleteProfilePicture({ photo }) {
  fs.unlink("./public/images/profile-picture/" + photo, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("removed");
  });

  fs.unlink("./public/images/profile-picture/100x100/" + photo, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("removed");
  });
}*/

exports.changeProfilePicture = (req, res) => {
 /* console.log("rud",req.userData)
  console.log("rb",req.body)*/
  const imgbody = JSON.parse(req.body)
  User.findById(req.userData.userId)
    .select("profilePicture")
    .then((data) => {
      /*if (data.profilePicture !== "person.png") {
        deleteProfilePicture({ photo: data.profilePicture });
      }*/

      User.findOneAndUpdate(
        { _id: req.userData.userId },
        { profilePicture: imgbody.photo },
        { new: true }
      )
        .select("profilePicture")
        .then((user) => {
          console.log(user)
          return res.status(200).json({ user });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ message: err.message });
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: err.message });
    });
};

exports.activate = (req, res) => {
  if (process.env.ENABLE_SEND_EMAIL === "false") {
    return res.status(200).header("Content-Type", "text/html")
      .send(`<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <meta name="theme-color" content="#000000">
        <style>
            .alert {
                padding: 20px;
                background-color: #f44336;
                color: white;
            }
        </style>
        <title>Travel Go</title>
    </head>
    
    <body>
        <div class="alert">
            <strong>Error!</strong> la activaci??n por correo se ha deshabilitado.
        </div>
    
    </body>
    
    </html>
  `);
  }
  try {

    console.log(req.params);
    const decoded = jwt.verify(req.params.token, process.env.JWT_KEY);

    User.findByIdAndUpdate(decoded._id, {
      activated: true,
    })
      .then(() => {
        return res.status(200).header("Content-Type", "text/html")
          .send(`<!DOCTYPE html>
          <html lang="en">
      
          <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
              <meta name="theme-color" content="#000000">
              <style>
                  .alert {
                      padding: 20px;
                      background-color: #4CAF50;
                      color: white;
                  }
              </style>
              <title>TravelGo</title>
          </head>
          
          <body>
              <div class="alert">
                  <strong>Exito!</strong> La cuenta se ha activado.
                  <a href="https://travelgo-vert.vercel.app/login"
                  target="_blank">Iniciar Sesion</a>

                  
              </div>
          
          </body>
          
          </html>
          `);
      })
      .catch((err) => {
        console.log(err);
        return res.status(401).header("Content-Type", "text/html")
          .send(`<!DOCTYPE html>
          <html lang="en">
          
          <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
              <meta name="theme-color" content="#000000">
              <style>
                  .alert {
                      padding: 20px;
                      background-color: #f44336;
                      color: white;
                  }
              </style>
              <title>Travel Go</title>
          </head>
          
          <body>
              <div class="alert">
                  <strong>Error!</strong> Ha ocurrido un problema. Intente de nuevo m??s tarde.
              </div>
          
          </body>
          
          </html>
        `);
      });
  } catch (err) {
    return res.status(401).header("Content-Type", "text/html")
      .send(`<!DOCTYPE html>
      <html lang="en">
      
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
          <meta name="theme-color" content="#000000">
          <style>
              .alert {
                  padding: 20px;
                  background-color: #f44336;
                  color: white;
              }
          </style>
          <title>TravelGo</title>
      </head>
      
      <body>
          <div class="alert">
              <strong>Error!</strong> URL invalido.
          </div>
      
      </body>
      
      </html>
    `);
  }
};

exports.addUser = (req, res) => {
  //console.log(req.body);
  try{
    jsonuser = JSON.parse(req.body);

  }catch (error){
    jsonuser = req.body
  }
  
  User.findOne({
    $or: [{ email: jsonuser.email }, { username: jsonuser.username }],
  }).then((user) => {
    if (!user) {
     // bcrypt.hash(jsonuser.password, 10, (err, hash) => {
       /* if (err) {
         // console.log(jsonuser)
          console.log(err)
          return res.status(500).json({ error: err });
        } else {*/
          const user = new User({
            email: jsonuser.email,
            firstName: jsonuser.firstName,
            lastName: jsonuser.lastName,
            username: jsonuser.username,
  //         password: hash,
            type: jsonuser.type,
          });

          user
            .save()
            .then((user) => {
              notificationHandler.sendNewUser({ req, user });
              const following = new Following({ user: user._id }).save();
              const followers = new Followers({ user: user._id }).save();
              Promise.all([following, followers]).then(() => {
                if (process.env.ENABLE_SEND_EMAIL === "true") {
                  emailHandler.sendVerificationEmail({
                    email: user.email,
                    _id: user._id,
                    username: user.username,
                  });
                  return res.status(201).json({
                    estado: "success",
                    message: "Verifica tu email"
                  });
                } else {
                  return res.status(201).json({
                    estado: "success",
                    message: "Cuenta creada con Exito"
                  });
                }
              });
            })
            .catch((err) => {

              return res.status(500).json({ message: err.message });
            });
      //  }
      //}
      //);
    } else {
      if (user.username === jsonuser.username) {
        console.log("user existe  ")
        //res.status(409)
        return res.status(409).json({
          estado: "error",
          message: "Este usuario ya existe "
        });
/*
        return JSON.parse(JSON.stringify({
          message: "existe email",
        }));*/
      }
      if (user.email === jsonuser.email) {
        console.log("correo existe")
        //
       
        return res.status(409).json({
          estado: "error",
          message: "Este email ya est?? en uso"
        });
      }
    }
  });
};



exports.resetPassword = (req, res) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ message: err });
    } else {
      User.findOneAndUpdate({ email: req.userData.email }, { password: hash })
        .then(() => {
          return res.status(200).json({ message: "Contrase??a cambiada" });
        })
        .catch((err) => {
          console.log(err.message);
          return res.status(500).json({ message: err.message });
        });
    }
  });
};


exports.sendVerificationEmail = (req, res) => {
  User.findOne({ email: req.body.email, activated: false })
    .select("email username")
    .then((user) => {
      if (user) {
        emailHandler.sendVerificationEmail(user);
        return res.status(200).json({ message: "Correo enviado." });
      }
      return res.status(400).json({ message: "Ha ocurrido un problema." });
    });
};


exports.sendforgotPasswordEmail = (req, res) => {
  //console.log("rbforgot",req.body);
  User.findOne({ email: req.body.email })
    .select("email username")
    .then((user) => {
      if (user) {
        console.log(user)
        emailHandler.sendPasswordResetEmail(user);
        return res.status(200).json({ message: "Correo enviado." });
      }
      return res.status(400).json({ message: "Algo ha salido bien." });
    });
};


exports.loginUser = (req, res, next) => {
  try{
    jsonuser = JSON.parse(req.body);

  }catch (error){
    jsonuser = req.body
  }
  User.aggregate([
    {
      $match: {
        $or: [{ email: jsonuser.email }, { username: jsonuser.email }],
      },
    },
    {
      $project: {
        _id: 1,
        username: 1,
        email: 1,
       // password: 1,
      },
    },
  ])
    .then((users) => {
      if (users.length < 1) {
        return res.status(400).json({
          message: "Credenciales incorrectas",
        });
      } else {
      //  bcrypt.compare(jsonuser.password, users[0].password, (err, result) => {
         /* if (err) {
            return res.status(400).json({
              message: "Credenciales incorrectas",
            });
          }*/
       //   if (result) {
            const token = jwt.sign(
              {
                email: users[0].email,
                userId: users[0]._id,
                username: users[0].username,
              },
              process.env.JWT_KEY//,
             /* {
                expiresIn: "999m",
              }*/
            );

            const user = {
              _id: users[0]._id,
              token: "Bearer " + token,
            };
            req.user = user
            //console.log("userdata01",jsonuser)
            next();
            //res.send();
            //console.log("userdata02",jsonuser)
            return ;
        /*  }
          return res.status(400).json({ message: "Credenciales incorrectas" });*/
      //  });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: err });
    });
};
exports.sendUserData = (req, res) => {
  //console.log("2sudd",req.body)
  //console.log("sud",req);
  //console.log("ud",req.user)
  try{
    jsonuser = JSON.parse(req.body);

  }catch (error){
    jsonuser = req.body
  }
 //console.log(req.body)
  //console.log(req.user)
//  console.log("ru",req.user)
 // console.log("rb",req.body)
 // console.log(req.user.token)

  if (req.user === undefined){
    return res.status(200).json({ user: req.body });
  }

  //console.log("userdata",req.user)
  //console.log("userbody",req.body)
  return res.status(200).json({ user: req.user });
};

exports.deleteUser = (req, res) => {
  User.remove({ _id: req.userData.userId }).then((result) => {
    res
      .status(200)
      .json({
        message: "Usuario borrado",
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  });
};
//{ $match: { $or: [{ email: req.body.email }, { username: req.body.username }], _id: { $not: req.userData.username }} }
exports.updateUser = (req, res) => {
  User.find({
    $and: [
      { $or: [{ email: req.body.email }, { username: req.body.username }] },
      { _id: { $ne: req.userData.userId } },
    ],
  })
    .select("username email")
    .then((user) => {
      if (user.length) {
        const { username, email } = user[0];

        if (username === req.body.username) {
          return res.status(409).json({
            message: "Este usuario ya existe",
          });
        }

        if (email === req.body.email) {
          return res.status(409).json({
            message: "Este correo ya est?? en uso",
          });
        }
      } else {
        User.findByIdAndUpdate(
          req.userData.userId,
          {
            ...req.body,
          },
          { new: true }
        )
          .select("firstName lastName username email bio")
          .then((user) => {
            const token = jwt.sign(
              {
                email: user.email,
                userId: user._id,
                username: user.username,
              },
              process.env.JWT_KEY/*,
              {
                expiresIn: "30m",
              }*/
            );

            return res.status(200).json({ user, token: "Bearer " + token });
          })
          .catch((err) => {
            console.log(err);
            return res.status(500).json({ message: err });
          });
      }
    });
};

exports.getUserData = (req, res, next) => {
  //console.log("1f ",req.body)
  //console.log("un id ",req.userData.userId)
  try{
    jsonuser = JSON.parse(req.body);

  }catch (error){
    jsonuser = req.body
  }
  //console.log("2dasdasd",jsonuser.profilePage)
 // console.log(req.body)
 // console.log("ju",jsonuser.profilePage)
  let q;
  if (jsonuser.profilePage) {
    q = [
      { $match: { _id: mongoose.Types.ObjectId(req.userData.userId) } },
      {
        $lookup: {
          from: "followings",
          localField: "_id",
          foreignField: "user",
          as: "followings",
        },
      },
      {
        $lookup: {
          from: "followers",
          localField: "_id",
          foreignField: "user",
          as: "followers",
        },
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          username: 1,
          email: 1,
          bio: 1,
          profilePicture: 1,
          type: 1,
          followingIds: { $arrayElemAt: ["$followings.following.user", 0] },
          followings: {
            $size: { $arrayElemAt: ["$followings.following.user", 0] },
          },
          followers: {
            $size: { $arrayElemAt: ["$followers.followers.user", 0] },
          },
          postLikes: "$postLikes.post",
          commentLikes: "$commentLikes.comment",
          commentReplyLikes: "$commentReplyLikes.comment",
        },
      },
    ];
  } else {
    q = [
      { $match: { _id: mongoose.Types.ObjectId(req.userData.userId) } },
      {
        $lookup: {
          from: "followings",
          localField: "_id",
          foreignField: "user",
          as: "followings",
        },
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          username: 1,
          profilePicture: 1,
          type: 1,
          followingIds: { $arrayElemAt: ["$followings.following.user", 0] },
          postLikes: "$postLikes.post",
          commentLikes: "$commentLikes.comment",
          commentReplyLikes: "$commentReplyLikes.comment",
        },
      },
    ];
  }
  const notification = Notification.find({
    receiver: mongoose.Types.ObjectId(req.userData.userId),
    read: false,
  }).countDocuments();

  const allNotification = Notification.find({
    receiver: mongoose.Types.ObjectId(req.userData.userId),
  }).countDocuments();

  const posts = Post.find({
    author: mongoose.Types.ObjectId(req.userData.userId),
  }).countDocuments();

  const messages = Message.find({
    receiver: mongoose.Types.ObjectId(req.userData.userId),
    read: false,
  }).countDocuments();

  const user = User.aggregate(q);

  Promise.all([user, notification, posts, messages, allNotification])
    .then((values) => {
      const user = values[0];

      if (user.length < 1) {
        return res.status(404).json({
          message: "Usuario no encontrado",
        });
      }

      const data = {
        ...user[0],
        notificationsCount: values[1],
        postsCount: values[2],
        messagesCount: values[3],
        allNotifications: values[4],
      };
     
      req.user = data;    
      //console.log(req);  
      next();
      //res.send();
      //console.log("userdata"+ jsonuser);
      //console.log("userdata2"+ jsonuser.user);
      //return;
    })
    .catch((err) => {
      return res.status(500).json({
        message: err.message,
      });
    });
};



exports.followUser = (req, res) => {
  ChatRoom.find({ members: { $all: [req.userData.userId, req.body.userId] } })
    .then((room) => {
      if (!room.length) {
        new ChatRoom({
          members: [req.body.userId, req.userData.userId],
        })
          .save()
          .then((room) => {
            room
              .populate(
                "members",
                "username firstName lastName profilePicture activityStatus"
              )
              .execPopulate()
              .then((room) => {
                messageHandler.sendRoom(req, {
                  userId: req.body.userId,
                  room: room.toObject(),
                });
              });
          });
      }
    })
    .catch((err) => {
      return res.status(500).json({
        message: err.message,
      });
    });

  // if user follows itself
  //  console.log("ru",req.userData)
   // console.log("rbb",req.body)

  if (req.userData.userId !== req.body.userId) {
    Following.updateOne(
      {
        user: req.userData.userId,
        "following.user": { $ne: req.body.userId },
      },
      {
        $addToSet: { following: { user: req.body.userId } },
      }
    ).then((document) => {
      if (document.nModified === 1) {
        const notification = new Notification({
          sender: req.userData.userId,
          message: "followed you",
          receiver: req.body.userId,
          type: "follow",
        }).save();

        const followers = Followers.updateOne(
          {
            user: req.body.userId,
          },
          {
            $push: { followers: { user: req.userData.userId } },
          }
        );

        const user = User.findById(req.userData.userId).select(
          "username profilePicture"
        );

        Promise.all([user, notification, followers])
          .then((values) => {
            notificationHandler.sendFollowNotification(req, values);
            return res.status(200).json({
              userId: req.body.userId,
              action: "followed",
            });
          })
          .catch((err) => console.log(err));
      } else {
        const following = Following.updateOne(
          { user: req.userData.userId },
          {
            $pull: { following: { user: req.body.userId } },
          }
        );

        const followers = Followers.updateOne(
          {
            user: req.body.userId,
          },
          {
            $pull: { followers: { user: req.userData.userId } },
          }
        );

        Promise.all([following, followers])
          .then(() => {
            return res.status(200).json({
              userId: req.body.userId,
              action: "unfollowed",
            });
          })
          .catch((err) => console.log(err));
      }
    });
  } else {
    return res.status(403).json({ message: "Error al seguir" });
  }
};

exports.getNewUsers = (req, res) => {
  //console.log("rq",req.body)
  //console.log("rqi",req.body.initialFetch)
  if (req.body.initialFetch) {
    const usersCount = User.find({}).countDocuments();
    const users = User.find()
      .select("username date profilePicture")
      .sort({ date: -1 })
      .limit(30);

    Promise.all([usersCount, users])
      .then((response) => {
        const [usersCount, users] = response;
        return res.status(200).json({ usersCount, users });
      })
      .catch((err) => res.status(500).json({ message: err.message }));
  } else {
    User.find({ _id: { $lt: req.body.lastId } })
      .select("username date profilePicture")
      .sort({ date: -1 })
      .limit(30)
      .then((users) => {
        return res.status(200).json({ users });
      })
      .catch((err) => res.status(500).json({ message: err.message }));
  }
};

exports.getUserProfileData = (req, res, next) => {
 // console.log("ru",req.userData)
  //console.log("reqbod",req.body)
  if (req.userData.username === req.body.username) {
    return res.status(200).json({ user: { loggedInUser: true } });
  }

  User.aggregate([
    { $match: { username: req.body.username } },
    {
      $lookup: {
        from: "followings",
        localField: "_id",
        foreignField: "user",
        as: "followings",
      },
    },
    {
      $lookup: {
        from: "followers",
        localField: "_id",
        foreignField: "user",
        as: "followers",
      },
    },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        username: 1,
        bio: 1,
        profilePicture: 1,
        type: 1,
        followings: {
          $size: { $arrayElemAt: ["$followings.following", 0] },
        },
        followers: {
          $size: { $arrayElemAt: ["$followers.followers", 0] },
        },
      },
    },
  ])
    .then((user) => {
      if (user.length < 1) {
        return res.status(404).json({
          message: "Usuario no encontrado",
        });
      }

      Post.find({
        author: mongoose.Types.ObjectId(user[0]._id),
      })
        .countDocuments()
        .then((postsCount) => {
          let data = {
            ...user[0],
            postsCount,
          };
          console.log("data",data)
          req.body.user = data;
          //req.user.loggedInUser = false;
          req.body.user.loggedInUser = false;
          next();
        })
        .catch((err) => {
          return res.status(500).json({
            message: err.message,
          });
        });
    })
    .catch((err) => {
      return res.status(500).json({
        message: err.message,
      });
    });
};

exports.getPosts = (req, res) => {
  //console.log("gp", req.body)
  Post.aggregate([
    {
      $match: {
        $and: [
          {
            _id: {
              $lt: mongoose.Types.ObjectId(req.body.lastId),
            },
            author: mongoose.Types.ObjectId(req.body.userId),
          },
        ],
      },
    },
    { $sort: { createdAt: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $lookup: {
        from: "postlikes",
        localField: "_id",
        foreignField: "post",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "post",
        as: "comments",
      },
    },

    {
      $project: {
        photo: 1,
        createdAt: 1,
        tags: 1,
        hashtags: 1,
        location: 1,
        likes: {
          $size: { $arrayElemAt: ["$likes.users_likes", 0] },
        },
        comments: {
          $size: "$comments",
        },
        description: 1,
        "author._id": 1,
        "author.username": 1,
        "author.profilePicture": 1,
      },
    },
  ])
    .then((posts) => {
      //return res.status(200).json({  });
      //req.body.user.posts = posts;
      console.log("posts",posts)
      return res.status(200).json({ posts });
    })
    .catch((err) => res.status(500).json({ message: err.message }));
};

exports.getUserPosts = (req, res, next) => {
  //console.log("upp", req.body)
  try{
    jsonuser = JSON.parse(req.body);

  }catch (error){
    jsonuser = req.body
  }
  //console.log("upjson",jsonuser.user)
  //console.log("gud",req.user._id)
  //console.log(jsonuser.profilePage)
  //console.log(req.user)
  //console.log("rb",req.body)
  if(req.user === undefined){
    jsonreq = req.body
  }else{
    jsonreq = req
  }
  if (jsonuser.profilePage) {
    Post.aggregate([
      {
        $match: { author: mongoose.Types.ObjectId(jsonreq.user._id) },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $lookup: {
          from: "postlikes",
          localField: "_id",
          foreignField: "post",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "comments",
        },
      },
      {
        $project: {
          photo: 1,
          createdAt: 1,
          tags: 1,
          location: 1,
          likes: {
            $size: { $arrayElemAt: ["$likes.users_likes", 0] },
          },
          comments: {
            $size: { $ifNull: ["$comments", []] },
          },
          description: 1,
          "author._id": 1,
          "author.username": 1,
        },
      },
    ])
      .then((posts) => {
        //console.log("todo ok")
        jsonreq.user.posts = posts;
        next();
        //res.send()
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ message: err.message });
      });
  } else {
    next();
  }
};

exports.searchUsersByUsername = (req, res) => {
  //console.log(req.body);
  console.log(req)
  if (req.body.q) {
    User.find({
      $or: [
        { firstName: new RegExp("^" + req.body.q, "i") },
        { lastName: new RegExp("^" + req.body.q, "i") },
        { username: new RegExp("^" + req.body.q, "i") },
      ],
    })
      .limit(10)
      .select("username profilePicture firstName lastName ")
      .then((users) => {
        console.log(users)
        return res.status(200).json({ users });
      })
      .catch((err) => res.status(500).json({ message: err.message }));
  }
};

exports.getFollowings = (req, res, next) => {

 // console.log("ud",req.userData)
  User.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(req.userData.userId) } },

    {
      $lookup: {
        from: "followings",
        localField: "_id",
        foreignField: "user",
        as: "followings",
      },
    },

    {
      $project: {
        followings: { $arrayElemAt: ["$followings.following.user", 0] },
      },
    },
  ])
    .then((user) => {
      console.log("usuario",user)
      req.body.followings = user[0].followings;
      next();
    })
    .catch((err) => res.status(500).json({ message: err.message }));
};

exports.getUserProfileFollowers = (req, res) => {
  Followers.find({ user: mongoose.Types.ObjectId(req.body.userId) })
    .populate("followers.user", "username profilePicture ")
    .then((users) => {
      return res.status(200).json({ users });
    })
    .catch((err) => res.status(500).json({ message: err.message }));
};

exports.getUserProfileFollowings = (req, res) => {
  Following.find({ user: mongoose.Types.ObjectId(req.body.userId) })

    .populate("following.user", "username profilePicture ")
    .then((users) => {
      return res.status(200).json({ users });
    })
    .catch((err) => res.status(500).json({ message: err.message }));
};

exports.changeStatus = (userId, clients, io) => {
  if (!clients.length) {
    Followers.find({ user: mongoose.Types.ObjectId(userId) })
      .select("followers.user")
      .then((user) => {
        user[0].followers.forEach((user) => {
          const toUserId = user.user;
          io.sockets.in(toUserId).emit("activityStatusUpdate", {
            activityStatus: "offline",
            user: userId,
          });
        });
      })
      .catch((err) => console.log(err.message));

    Following.find({ user: mongoose.Types.ObjectId(userId) })
      .select("following.user")
      .then((user) => {
        user[0].following.forEach((user) => {
          const toUserId = user.user;
          io.sockets.in(toUserId).emit("activityStatusUpdate", {
            activityStatus: "offline",
            user: userId,
          });
        });
      })
      .catch((err) => console.log(err.message));

    User.findByIdAndUpdate(
      { _id: userId },
      { activityStatus: "offline" },
      { new: true }
    )
      .then(() => {})
      .catch((err) => console.log(err.message));
  } else {
    Followers.find({ user: mongoose.Types.ObjectId(userId) })
      .select("followers.user")
      .then((user) => {
        user[0].followers.forEach((user) => {
          const toUserId = user.user;
          io.sockets.in(toUserId).emit("activityStatusUpdate", {
            activityStatus: "online",
            user: userId,
          });
        });
      })
      .catch((err) => console.log(err.message));

    Following.find({ user: mongoose.Types.ObjectId(userId) })
      .select("following.user")
      .then((user) => {
        user[0].following.forEach((user) => {
          const toUserId = user.user;
          io.sockets.in(toUserId).emit("activityStatusUpdate", {
            activityStatus: "online",
            user: userId,
          });
        });
      })
      .catch((err) => console.log(err.message));

    User.findByIdAndUpdate(
      { _id: userId },
      { activityStatus: "online" },
      { new: true }
    )
      .then(() => {})
      .catch((err) => console.log(err.message));
  }
};
