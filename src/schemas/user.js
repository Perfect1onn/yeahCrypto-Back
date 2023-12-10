import mongoose from "mongoose";

const User = new mongoose.Schema({
    username: {type: String, required: true, maxLength: 25, minLength: 3},
    password: {type: String, required: true, minLength: 3},
    email: {type: String, required: true},
    isActivated: {type: Boolean, default: false},
    activationLink: {type: String},
    imgUrl: {type: String, required: false}
})

export default mongoose.model("User", User)