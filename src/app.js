import express from "express"
import {Spot} from "@binance/connector-typescript";
import mongoose from "mongoose"
import cors from "cors"
import  cookieParser from "cookie-parser"
import { configDotenv } from "dotenv";
import withdraw from "./routers/withdraw.js";
import user from "./routers/user.js";
import {deposit} from "./routers/deposit.js";

configDotenv()

const app = express()
export const client = new Spot(process.env.API_KEY, process.env.API_SECRET, {
    baseURL: "https://api.binance.com"
})

app.use(express.json())
app.use(cookieParser())
app.use(cors())

app.use("/", withdraw)
app.use("/", user)
app.use("/", deposit)


app.get("/wallet/portfolio", (req, res) => {
    client.userAsset()
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((err) => {
            res.status(500).send({
                error: err.message
            })
        })
})

app.get("/wallet/address", (req, res) => {
    const {coin} = req.query
    client.depositAddress(coin)
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((err) => {
            console.log(err.message)
            res.status(500).send({
                error: err.message
            })
        })
})

async function server() {
    try {
        await mongoose.connect(process.env.DB_URL)
        app.listen(process.env.PORT, () => console.log(`Server started on ${process.env.PORT} port`))
    } catch (err) {
        console.log(err, "zdec")
    }
}

server()
