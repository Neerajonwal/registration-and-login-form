require('dotenv').config();
const express = require("express");
const app = express();
const hbs = require("hbs");
const path = require("path");
const Register = require("./models/registers");
const bcrypt = require("bcryptjs");
const cookieParser = require('cookie-parser');
const auth = require("./middleware/auth")
const jwt = require('jsonwebtoken');

const port = process.env.port || 8000;

require("./db/conn");


const static_path = path.join(__dirname, "../public");
const partials_path = path.join(__dirname, "../templates/partials");
const template_path = path.join(__dirname, "../templates/views");

// console.log(process.env.SECRATE_KEY)

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.get("", (req, res) => {
    res.render("index")
});
app.get("/secret", auth, (req, res) => {
    console.log(`this is the cookie awesome ${req.cookies.jwt}`)
    res.render("secret")
});

app.get("/logout", auth, async (req, res) => {
    try {
        console.log(req.user)

        // logout from single device
        req.user.tokens = req.user.tokens.filter((currentelemnt) => {
            return currentelemnt.token != req.token
        })

        // logout from all devices
        req.user.tokens = []

        res.clearCookie("jwt")
        console.log("logout successful")
        await req.user.save();
        res.status(201).render('login')
    }
    catch (err) {
        res.status(500).send(err)
    }
})

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
            const passwordHash = await bcrypt.hash(password, 10);
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: passwordHash,
                confirmpassword: req.body.confirmpassword
            })

            console.log("the succs part" + registerEmployee)
            
            const registered = await registerEmployee.save();
           
            res.status(201).render("login")
            // json(registered);
        } else {
            res.send("password are not matching")
        }

    } catch (err) {
        res.status(400).send(err)
    }
});

app.post("/login", async (req, res) => {
    try {
        console.log(req.body)
        const email = req.body.email;
        const password = req.body.password;
        console.log(email)
        const useremail = await Register.findOne({ email: email });
        console.log(useremail)
        if (useremail) {
            const isMatch = await bcrypt.compare(password, useremail.password)

            if (isMatch) {
                var token = jwt.sign({ email: useremail.email }, 'shhhhh');
                res.status(201).render("secret")
                // json({useremail,token})

            } else {
                res.send("invalid password details")
            }
        }else{
            res.status(400).send("user  dosenot exist") 
        }
       
    } catch (err) {
        res.status(400).send("invalid log in  details")

    }



    

})

app.listen(port, () => {
    console.log(`live srever ${port}`)
})