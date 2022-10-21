const mongoose = require("mongoose");
mongoose.Promise = global.Promise;



const postSchema = new mongoose.Schema({
  description: {
    type: String,
    trim: true,
    default: ""
  },
  price : {
    type: String,
    default: "0.00"
  },
  ubicationTitle: {
    type: String,
    trim: true,
    default: ""
  },
  ubicationSnippet: {
    type: String,
    trim: true,
    default: ""
  },
  photo: {
    type: String,
    required: "Please select image"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "You must supply an author"
  },
  hashtags: {
    type: Array,
    default: []
  },

  latitud: {
    type: String,
    trim: true,
  },
  longitud : {
    type: String,
    trim: true,
  },

/*
  location: {
    type: {
      type: String
    },
    coordinates: { type: [], default: undefined },
    address: {
      type: String
    }
  },*/

  tags: {
    type: Array,
    default: []
  }
});

postSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Post", postSchema);
