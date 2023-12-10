import {Schema, model} from "mongoose";

const Network = new Schema({
    network: {type: String},
    coin: {type: String, ref: "Coin"},
    entityTag: {type: String},
    withdrawIntegerMultiple: {type: String},
    isDefault: {type: Boolean},
    depositEnable: {type: Boolean},
    withdrawEnable: {type: Boolean},
    depositDesc: {type: String},
    withdrawDesc: {type: String},
    specialTips: {type: String},
    specialWithdrawTips: {type: String},
    name: {type: String},
    withdrawFee: {type: String},
    withdrawMin: {type: String},
    withdrawMax: {type: String},
    minConfirm: {type: Number},
    unLockConfirm: {type: Number},
    estimatedArrivalTime: {type: Number},
    busy: {type: Boolean},
    country: {type: String}
})

export default model("Network", Network)