import User from "../schemas/user.js";
import bcrypt from "bcrypt"
import {v4} from "uuid"
import jwt from "jsonwebtoken"
import Token from "../schemas/token.js";
import modemailer from "nodemailer"

export const validateAccessToken = (accessToken) => {
    try {
        const isValidToken = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET)
        return isValidToken
    } catch (err) {
        return null
    }
}

const validateRefreshToken = (refreshToken) => {
    try {
        const isValidToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
        return isValidToken
    } catch (err) {
        return null
    }
}

const generateToken = async ( payload ) => {
    const accessToken = jwt.sign(payload,process.env.JWT_ACCESS_SECRET, {
        expiresIn: "15m"
    })
    const refreshToken = jwt.sign(payload,process.env.JWT_REFRESH_SECRET, {
        expiresIn: "20d"
    })

    return {
        accessToken,
        refreshToken
    }
}

const saveToken = async (userId, refreshToken) => {
    const tokenData = await Token.findOne({user: userId})
    if(tokenData) {
        await tokenData.updateOne({refreshToken: refreshToken})
        return;
    }

    const token = await Token.create({
        user: userId,
        refreshToken
    })
    return token
}

const deleteToken = async (refreshToken) => {
    const token = await Token.deleteOne({ refreshToken })
    return token
}

const sendMailActivation = async (to, link) => {
    const transporter = modemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "yeahcryptoexchange@gmail.com",
            pass: "gfwi zrzt amkd vjze"
        },
    })

    await transporter.sendMail({
        from: "yeahcryptoexchange@gmail.com",
        to,
        subject: "Активация аккаунта yeahCrypto",
        text: "",
        html:
            `    
                <div>
                    <h1>Активация аккаунта</h1>
                    <a href="${link}">${link}</a>
                </div>
            `
    })
}

const registerUser = async (req, res, next) => {
    const {username, password, email} = req.body
    try {
        const hasUser = await User.findOne({email})

        if (hasUser) {
            return res.status(400).send("user already exist")
        }

        const hashPassword = await bcrypt.hash(password, 3)
        const activationLink = v4()

        const user = await User.create({
            username,
            password: hashPassword,
            email,
            balance: 0,
            activationLink,
            depositOrders: [],
            withdrawOrders: []
        })

        await sendMailActivation(email, `http://localhost:4000/activate/${activationLink}`)


        const {refreshToken, accessToken} = await generateToken({username, email, activationLink})
        await saveToken(user._id, refreshToken)


        res.status(201).cookie( "refreshToken", refreshToken, {
            maxAge: 20 * 24 * 60 * 60 * 1000,
            httpOnly: true
        }).send({id: user._id, username, email, accessToken, refreshToken})
    } catch (err) {
        res.status(400).send(err.message)
        ks
    }
}

const loginUser = async (req, res) => {
    const {email, password} = req.body

    const user = await User.findOne({
        email
    })

    if(!user) {
        return res.status(401).send("Такого пользователя не существует")
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.password)

    if(passwordIsCorrect) {
        const {refreshToken, accessToken} = await generateToken({email, password})
        await saveToken(user._id, refreshToken)
        return res.status(201).cookie( "refreshToken", refreshToken, {
            maxAge: 20 * 24 * 60 * 60 * 1000,
            httpOnly: true
        }).send({id: user._id, username: user.username, email: user.email, accessToken, refreshToken})
    }

    res.status(401).send("Введенные данные не верны")
}

const logout = async (req, res) => {
    const { refreshToken } = req.cookies
    const token = await deleteToken(refreshToken)
    res.clearCookie("refreshToken")
    return res.status(200).send(token)
}

const activate = async (req, res) => {
    const link = req.params.link
    const user = await User.findOneAndUpdate({
        activationLink: link
    }, {
        isActivated: true
    })

    res.send("<h1>кайф</h1>")
}

const refresh = async (req, res) => {
    const { refreshToken: refreshTokenFromCookies } = req.cookies

    if(!refreshTokenFromCookies) {
        console.log("zdec0")
        return res.status(401).send("Не валидный токен")

    }

    const tokenIsValid = validateRefreshToken(refreshTokenFromCookies)
    const hasTokenDb = await Token.findOne({refreshToken: refreshTokenFromCookies})

    if(!tokenIsValid || !hasTokenDb) {
        return res.status(401).send("Не валидный токен")
    }
    const user = await User.findOne({
        email: tokenIsValid.email
    })

    const {refreshToken, accessToken} = await generateToken({email: user.email, password: user.password})
    await saveToken(user._id, refreshToken)
    return res.status(201).cookie( "refreshToken", refreshToken, {
        maxAge: 20 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }).send({id: user._id, username: user.username, email: user.email, accessToken, refreshToken})
}

const getUserById = async (req, res) => {
    const id = req.params.id
    try {
        const user = await User.findById(id)
        res.status(200).send(user)
    } catch (err) {
        res.status(404).send("user not found")
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
        res.status(200).send(users)
    } catch (err) {
        res.status(500).send()
    }
}

export default { registerUser, getUserById , getAllUsers, loginUser, logout, activate, refresh, validateAccessToken}