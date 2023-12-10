import {Schema, model} from "mongoose";

const Coin = new Schema({
    coin: {type: String},
    depositAllEnable: {type: Boolean},
    withdrawAllEnable: {type: Boolean},
    name: {type: String},
    withdrawing: {type: String},
    isLegalMoney: {type: Boolean},
    trading: {type: Boolean},
})


export default model("Coin", Coin)