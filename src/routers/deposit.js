import Router from "express"
import Coin from "../schemas/coin.js";
import Network from "../schemas/network.js";
import {client} from "../app.js";
import Transaction from "../schemas/transaction.js";
import Balance from "../schemas/wallet.js";
import {authMiddleware} from "../middleware/auth-middleware.js";


export const deposit = new Router()

deposit.get("/deposit/coins", authMiddleware ,async (req, res) => {
    try {
        const coins = await Coin.find()
        res.status(200).send(coins)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

deposit.get("/deposit/coins/:name", async (req, res) => {
    const coinName = req.params.name
    try {
        const coins = await Coin.find({
            coin: coinName
        })
        res.status(200).send(coins)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

deposit.get("/deposit/networks", async (req, res) => {
    try {
        const networks = await Network.find()
        res.status(200).send(networks)
    } catch (err) {
        res.status(400).send(err.message)
    }
})


deposit.get("/deposit/networks/:name", async (req, res) => {
    const networkName = req.params.name
    try {
        const networks = await Network.find({
            coin: networkName
        })
        res.status(200).send(networks)
    } catch (err) {
        res.status(400).send(err.message)
    }
})


deposit.post("/deposit/address", async (req, res) => {
    const { coin, network} = req.body
    try {
        client.depositAddress(coin, {
            network
        }).then(response => {
            res.status(200).send(response)
        }).catch(err => {
            res.status(400).send(err.message)
        })
    } catch (err) {
        res.status(400).send(err.message)
    }
})

deposit.post("/deposit/confirm", async (req, res) => {
    const { userId, transactionType, transactionId, stock} = req.body

    let hasTransaction

    await client.depositHistory().then((transactions) => {
        hasTransaction = transactions.find(transaction => transaction.txId === `Internal transfer ${transactionId}`)
    }).catch(err => {
        res.status(400).send(err)
    })

    if(!hasTransaction) {
        return res.status(400).send("Транзакция не найдена")
    }


    let hasTransactionInDb = await Transaction.findOne({txId: transactionId})

    if(hasTransactionInDb) {
        return res.status(400).send("Транзакция уже не действительна")
    }

    const transaction = await Transaction.create({
        transactionDepositId: userId,
        txId: transactionId,
        transactionType: transactionType,
        asset: hasTransaction.coin,
        network: hasTransaction.network,
        stock,
        amount: hasTransaction.amount,
        status: hasTransaction.status,
        to: "to own account",
        timestamp: hasTransaction.insertTime
    })

    let hasCoinInDb = await Balance.findOneAndUpdate({
        balanceId: userId,
        asset: transaction.asset
    })

    if(hasCoinInDb) {
        await Balance.findOneAndUpdate({
            balanceId: userId,
            asset: transaction.asset
        },{
            amount: `${+hasTransaction.amount + +hasCoinInDb.amount}`
        })
    }else {
        await Balance.create({
            balanceId: userId,
            asset: transaction.asset,
            amount: transaction.amount,
            stock: stock,
            freeze: 0
        })
    }
    res.status(201).send(transaction)
})
