import mongoose, {Schema} from "mongoose";

const Balance = new mongoose.Schema({
    balanceId: {type: Schema.Types.ObjectId, ref: "User"},
    asset: {type: String},
    amount: {type: String},
    stock: {type: String},
    freeze: {type: Number},
})

export default mongoose.model("Balance", Balance)
