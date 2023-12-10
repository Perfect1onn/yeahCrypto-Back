import Router from "express"
import { client } from "../app.js";
import Wallet from "../schemas/wallet.js";

const withdraw = new Router()

withdraw.post("/withdraw/confirm", async (req, res) => {
    const { coin, address, amount, userdId } = req.body

    const wallet = await Wallet.findOne({
        balanceId: userdId,
        asset: coin
    })

    if(+wallet.amount < amount) {
        return res.status(400).send("Не достаточный баланс")
    }

    client.withdraw(coin, address, amount).then(async (response) => {
        await Wallet.findOneAndUpdate({
            balanceId: userdId,
            asset: coin
        }, {
            amount: `${+wallet.amount - amount}`
        })
        res.status(200).send(response)
    }).catch(err => {
        res.status(400).send(err)
    })
})

export default withdraw