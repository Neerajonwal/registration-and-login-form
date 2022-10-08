require('dotenv').config();
const express = require("express");
const app = express();
const hbs = require("hbs");
const path = require("path");
const Register = require("./models/registers");
const bcrypt = require("bcryptjs");
const port = process.env.port || 8000;

require("./db/conn");


const static_path = path.join(__dirname, "../public");
const partials_path = path.join(__dirname, "../templates/partials");
const template_path = path.join(__dirname, "../templates/views");

console.log(process.env.SECRATE_KEY)

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path))
app.set("view engine", "hbs");
app.set("views", template_path)
hbs.registerPartials(partials_path)

app.get("", (req, res) => {
    res.render("index")
});
app.get("/index", (req, res) => {
    res.render("index")
});
app.get("/login", (req, res) => {
    res.render("login")
});
app.get("/register", (req, res) => {
    res.render("register")
});


app.post("/register", async (req, res) => {
    try {

        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if (password === cpassword) {
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword
            })

            console.log("the succs part" + registerEmployee)
            const token = await registerEmployee.generateAuthToken()

            console.log("the token part" + token)

            const register = await registerEmployee.save();
            res.status(201).render("index")
        } else {
            res.send("password are not matching")
        }

    } catch (err) {
        res.status(400).send(err)
    }
});

app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({ email: email });

        const isMatch = await bcrypt.compare(password, useremail.password)

        const token = await useremail.generateAuthToken()
        console.log("the token part" + token)

        if (isMatch) {
            res.status(201).render("index")
        } else {
            res.send("invalid password details")
        }
    } catch (err) {
        res.status(400).send("invali login details")

    }




    // const bcrypt = require("bcryptjs");

    // const passwordHash = await bcrypt.hash(password, 10);
    // const securepassword = async (password) => {
    //     console.log(passwordHash);

    //     const passwordmatch = await bcrypt.compare("neerman7jan", passwordHash);
    //     console.log(passwordmatch);
    // }

    // securepassword("neerman7jan");










})

app.listen(port, () => {
    console.log(`live srever ${port}`)
})