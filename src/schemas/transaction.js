import mongoose, {Schema} from "mongoose";

const Transaction = new mongoose.Schema({
    transactionDepositId: {type: Schema.Types.ObjectId, ref: "User"},
    txId: {type: String, required: true},
    transactionType: {type: String, required: true},
    status: {type: Number, required: true},
    network: {type: String, required: true},
    stock: {type: String, required: true},
    to: {type: String, required: true},
    asset: {type: String, required: true},
    amount: {type: String, required: true},
    timestamp: {type: Number, required: true}
})

export default mongoose.model("Transaction", Transaction)
