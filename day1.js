// // doc noi dung file va tinh tong
// var f = require('fs');
// // var sum = 0;
// // f.readFile('./a.txt', 'utf8', function (err, data) {
// //     f.readFile('./b.txt', 'utf8', function (err, data1) {
// //         f.readFile('./c.txt', 'utf8', function (err, data2) {
// //             sum += +data;
// //             sum += +data1;
// //             sum += +data2;
// //             console.log(sum);
// //         });
// //     });
// // });

// var f = require('fs');
// var sum = 0;
// f.readFile('./a.txt', 'utf8', function (err, data) {
//     sum += +data;
//     console.log(data);

// });

// f.readFile('./b.txt', 'utf8', function (err, data1) {
//     sum += +data1;
//     console.log(data1);

// });

// f.readFile('./c.txt', 'utf8', function (err, data2) {
//     sum += +data2;
//     console.log(data2);
// });


// console.log(sum);

// var f = require('fs');
// const express = require('express')
// const app = express()
// const port = 3000

// let number = 0
// app.get('/', getMethod)

// function getMethod(req, res) {
//     f.readFile('./log.txt', 'utf-8', function (err, data) {
//         if (data && !err) {
//             number = 1 + parseInt(data)
//             f.writeFileSync('./log.txt', number.toString())
//         } else {
//             number = 1
//             f.writeFileSync('./log.txt', number.toString())
//         }
//         res.send('Hello World! TotalView: ' + number)
//     })
// }

// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`)
// })

var f = require('fs');
const express = require('express')
const morgan = require('morgan')
const bcrypt = require("bcrypt")
const bodyParser = require('body-parser')
const req = require('express/lib/request')
const app = express()
const port = 3000
const pathUsers = './users.json'

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

function getMethod(req, res) {
    res.send('ok')
}
app.get('/product/:id/:name', function (req, res) {
    // query, param
    console.log(req.params)
    res.send('ok')
})

app.post('/product', function (req, res) {
    // query, param, body
    res.json(req.body)
})

app.post('/register', async function (req, res) {
    if (!f.existsSync(path))
        f.appendFile(pathUsers, '')
    const { username, password: pwd } = req.body
    if (username && pwd && pwd.length === 6) {
        const dt = f.readFileSync(path, 'utf8')
        if (dt) {
            const dataUser = JSON.parse(f.readFileSync(path, 'utf8'))
            const user = await dataUser.find(x => x.username === username)
            if (!user) {
                const salt = await bcrypt.genSalt(10)
                const pwdhash = await bcrypt.hash(pwd, salt)
                req.body.password = pwdhash
                dataUser.push(req.body)
                f.writeFileSync(pathUsers, JSON.stringify(dataUser))
                return res.send('Add User Success!')
            } else {
                return res.send('Duplicate!')
            }
        } else {
            const salt = await bcrypt.genSalt(10)
            const pwdhash = await bcrypt.hash(pwd, salt)
            req.body.password = pwdhash
            f.writeFileSync(pathUsers, JSON.stringify([req.body]))
            return res.send('Add User Success!')
        }
    }
    return res.json(req.body)
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body
    const dataUser = JSON.parse(f.readFileSync(pathUsers, 'utf8'))
    const user = await dataUser.find(x => x.username === username)
    if (user) {
        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
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