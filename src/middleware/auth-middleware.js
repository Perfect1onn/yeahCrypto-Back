import {validateAccessToken} from "../controllers/users.js";

export const authMiddleware = (req, res, next) => {
    try {
        const authorizationHeader = req.headers.authorization

        if(!authorizationHeader) {
            return res.status(401).send("Не указан токен авторизации")
        }

        const authorizationToken = authorizationHeader.split(" ")[1]

        if(!authorizationToken) {
            console.log("2")
            return res.status(401).send("Не указан токен авторизации")
        }

        const isValidToken = validateAccessToken(authorizationToken)

        if(!isValidToken) {
            return res.status(401).send("Токен указан не верно")
        }

        next()
    } catch (err) {
        next(err)
    }
}