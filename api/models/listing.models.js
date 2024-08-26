import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: {
      required: true,
      type: String,
    },
    description: {
      required: true,
      type: String,
    },
    address: {
      required: true,
      type: String,
    },
    area: {
      required: true,
      type: Number,
    },
    bath: {
      required: true,
      type: Number,
    },
    bed: {
      required: true,
      type: Number,
    },

    living: {
      required: true,
      type: Number,
    },

    BHK: {
      required: true,
      type: Number,
    },

    builtyear: {
      required: true,
      type: Number,
    },

    Road:{
      required: true,
      type: Number,
    },

    Yourarea: {
      required: true,
      type: String,
    },

    condition: {
      required: true,
      type: Number,
    },

    housetype: {
      required: true,
      type: String,
    },
    direction: {
      required: true,
      type: String,
    },

    Road: {
      require: true,
      type: Number,
    },


    price: {
      required: true,
      type: Number,
    },
    discountPrice: {
      type: Number,
    },
    furnished: {
      required: true,
      type: Boolean,
    },
    parking: {
      required: true,
      type: Number,
    },
    type: {
      type: String,
      required: true,
    },
    offer: {
      type: Boolean,
      required: true,
    },
    imgUrl: {
      type: Array,
      required: true,
    },
    userRef: {
      type: String,
      required: true,
    },
    location: {
      // This will store the latitude and longitude as an object
      lat:{
        type: Number,
        required: true,
      },
      lng:{
        type: Number,
        required: true,
      },
    },

  },
  { timestamps: true }
);

const Listing = mongoose.model("Post", listingSchema);

export default Listing;
