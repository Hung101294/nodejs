const express = require('express')
const f = require('fs')
const moment = require('moment')
const handlebars = require("express-handlebars")
const morgan = require('morgan')
const bodyParser = require('body-parser')
const session = require('express-session')
const { render } = require('express/lib/response')
const { fail } = require('assert')
const crypto = require("crypto")
const pathUsers = './users.json'
const secret = "!@#";
const app = express()
const port = 3000
const hbs = handlebars.create({
    helpers: {
        formatTimestamp: function (timestamp) {
            return moment.unix(+timestamp).format("DD-MM-YYYY HH:mm:ss")
        }
    }
})

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 } }))
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(morgan(':remote-addr :method :url :status :res[content-length] - :response-time ms'))

function passwordHashCrypto(pwd, res) {
    const sha256Hasher = crypto.createHmac("sha256", secret);
    password = sha256Hasher.update(pwd).digest("hex");
    return password
}

app.post('/register', async function (req, res) {
    const classActive = "right-panel-active";
    const { username, password: pwd } = req.body
    if (!username) {
        // return res.status(405).json({ message: "Username invalid!" })
        return res.render("login", { layout: false, classActive: classActive, username: username, password: pwd, messageRegister: "Username invalid!" })
    }
    if (!pwd) {
        // return res.status(400).json({ message: "Password invalid!" })
        return res.render("login", { layout: false, classActive: classActive, username: username, password: pwd, messageRegister: "Password invalid!" })
    } else {
        if (!(pwd.length === 6)) {
            // return res.status(407).json({ message: "Password is only allowed 6 characters!" })
            return res.render("login", { layout: false, classActive: classActive, username: username, password: pwd, messageRegister: "Password is only allowed 6 characters!" })
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
                    // return res.status(200).json({ message: "Add User Success!" })
                    req.session.username = { username: username }
                    return res.render("home", { username: username })
                } else {
                    // return res.status(408).json({ message: "Duplicate!" })
                    return res.render("login", { layout: false, classActive: classActive, username: username, password: pwd, messageRegister: "Duplicate!" })
                }
            } else {
                f.writeFileSync(pathUsers, JSON.stringify([req.body]))
                req.session.username = { username: username }
                return res.render("home", { username: username })
                // return res.status(200).json({ message: "Add User Success!" })
            }
        }
    }
})

app.post('/login', async (req, res) => {
    const classActive = "";
    const { username, password } = req.body
    const dataUser = JSON.parse(f.readFileSync(pathUsers, 'utf8'))
    const user = await dataUser.find(x => x.username === username)
    if (user) {
        // const validPassword = await bcrypt.compare(password, user.password);
        const pwdhash = passwordHashCrypto(password, '')
        // if (validPassword) {
        if (pwdhash === user.password) {
            req.session.username = { username: username }
            // res.status(200).json({ message: "Login Success" })
            return res.render("home", { username: username })
        } else {
            // res.status(400).json({ error: "Invalid Password" })
            return res.render("login", { layout: false, classActive: classActive, username: username, password: password, messageLogin: "Invalid Password" })
        }
    } else {
        // res.status(401).json({ error: "User does not exist" })
        return res.render("login", { layout: false, classActive: classActive, username: username, password: password, messageLogin: "User does not exist" })
    }
});

app.get("/", function (req, res) {
    const classActive = "";
    if (!req.session.username) {
        // req.session.view++
        return res.render("login", { layout: false, classActive: classActive, message: "" })
    } else {
        const username = req.session.username.username
        return res.render("home", { username: username })
    }
    // res.json({ a: req.session.view })
    // if (dalogin) {
    //     res.render("home", { name: "aaaa", date: 1654605813 })
    // } else {
    //     res.render("login")
    // }
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})