// bài tập:
// Bài 1: 7đ

// Viết tiếp api login từ file json đã đăng ký

// Bài 2: 3đ

// Mã hóa 1 chiều password của người dung

// Đọc them về mã hóa tại https://viblo.asia/p/tai-sao-can-ma-hoa-mat-khau-va-cac-kieu-ma-hoa-co-ban-yMnKML0Q57P

// https://dominhhai.github.io/vi/2016/02/nodejs-ecrypt-password-with-bcrypt/

// author: Đặng Mạnh Hùng

// sử dụng 2 cách mã hóa: bcrypt, crypto: sha256

var f = require('fs');
const express = require('express')
// npm i --save morgan
const morgan = require('morgan')
// npm i --save bcrypt
const bcrypt = require("bcrypt")
// npm i --save crypto
const crypto = require("crypto")
// npm i --save body-parser
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const pathUsers = './users.json'
const secret = "hungdm@101294!@#$%^";


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

if (!(f.existsSync(pathUsers))) {
    f.writeFileSync(pathUsers, '')
}

async function passwordHashbcrypt(pwd, res){
    const salt = await bcrypt.genSalt(10)
    const pwdhash = await bcrypt.hash(pwd, salt)
    res = pwdhash
    return pwdhash
}

function passwordHashCrypto(pwd, res) {
    const sha256Hasher = crypto.createHmac("sha256", secret);
    password = sha256Hasher.update(pwd).digest("hex");
    return password
}

app.post('/register', async function (req, res) {
    const { username, password: pwd } = req.body
    if (!username) {
        return res.status(405).json({ message: "Username invalid!" })
    }
    if (!pwd) {
        return res.status(400).json({ message: "Password invalid!" })
    } else {
        if (!(pwd.length === 6)) {
            return res.status(407).json({ message: "Password is only allowed 6 characters!" })
        } else {
            const stringUsers = f.readFileSync(pathUsers, 'utf8')
            // const pwdhash = await passwordHashbcrypt(pwd, '')
            const pwdhash = passwordHashCrypto(pwd, '')
            req.body.password = pwdhash
            if (stringUsers) {
                const dataUser = JSON.parse(stringUsers)
                const user = await dataUser.find(x => x.username === username)
                if (!user) {
                    dataUser.push(req.body)
                    f.writeFileSync(pathUsers, JSON.stringify(dataUser))
                    return res.status(200).json({ message: "Add User Success!" })
                } else {
                    return res.status(408).json({ message: "Duplicate!" })
                }
            } else {
                f.writeFileSync(pathUsers, JSON.stringify([req.body]))
                return res.status(200).json({ message: "Add User Success!" })
            }
        }
    }
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body
    const dataUser = JSON.parse(f.readFileSync(pathUsers, 'utf8'))
    const user = await dataUser.find(x => x.username === username)
    if (user) {
        // const validPassword = await bcrypt.compare(password, user.password);
        const pwdhash = passwordHashCrypto(password, '')
        // if (validPassword) {
        if (pwdhash === user.password) {
            res.status(200).json({ message: "Login Success" });
        } else {
            res.status(400).json({ error: "Invalid Password" });
        }
    } else {
        res.status(401).json({ error: "User does not exist" });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})