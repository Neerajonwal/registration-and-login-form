require('dotenv').config()
const express = require("express");
const app = express();
const hbs = require("hbs");
const Register = require("./models/registers");
const bcrypt = require("bcryptjs");
const path = require("path");
const cookieParser = require('cookie-parser');
const auth = require("./middleware/auth")
const jwt = require('jsonwebtoken');

const port = process.env.port || 8000;

require("./db/conn");


const static_path = path.join(__dirname, "../public");
const partials_path = path.join(__dirname, "../templates/partials");
const template_path = path.join(__dirname, "../templates/views");

// console.log(process.env.SECRET_KEY);

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
        console.log(req.user);
        // for single logout
        // req.user.tokens = req.user.tokens.filter((currElement) => {
        //     return currElement.token != req.token
        // })

        // logout from all devices
        req.user.token = [];
        res.clearCookie("jwt");

        // res.clearCookie("jwt");
        console.log("logout succesfully")
        res.render("login")
    } catch (err) {
        res.status(500).send(err)
    }
})





app.get("/index", (req, res) => {
    res.render("index")
});
app.get("/login", (req, res) => {
    res.render("login")
});

app.get("/register", (req,res)=>{
res.render("register")
});



app.get("/register/get", async (req, res) => {
    try {
        const registerData = await Register.find();
        res.json(registerData)
        console.log(registerData);
    } catch (e) {
        res.status(404).send(e)
    }
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
                confirmpassword: passwordHash
                // req.body.confirmpassword
            })

            const token = await registerEmployee.generateAuthToken();
            // const token = jwt.sign({ _id: this._id }, 'shhhhh');
            console.log("this is token no." + token)

            console.log("the succs part" + registerEmployee)

            // the res.cookie() function is used to set the cookie name to value.
            // the value parameter may be a string or object converted to JSON.

            // syntax:

            // res.cookie(name, value, [option])

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 600000),
                httpOnly: true
            });
            console.log(cookie);

            const registered = await registerEmployee.save();

            res.status(201).render("index")
            // json(registered);
        } else {
            res.send("password are not matching")
        }

    } catch (err) {
        res.status(400).send(err)
    }
});


app.patch("/update/:id", async (req, res) => {
    try {
        const _id = req.params.id;
        const doneData = await Register.findByIdAndUpdate(_id, req.body,
            {
                new: true,
            });
        res.send(doneData);
    } catch (e) {
        res.status(404).send(e)
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
            const token = await useremail.generateAuthToken();
            // var token = jwt.sign({ email: useremail.email }, 'shhhhh'); this the token generate code 
            console.log("the login token" + token)
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 30000),
                httpOnly: true
            });

            console.log(`this is the cookie awasome : ${req.cookies.jwt}`);


            if (isMatch) {
                res.status(201).render("index")
                // json({useremail,token})

            } else {
                res.send("invalid password details")
            }
        } else {
            res.status(400).send("user  dosenot exist")
        }

    } catch (err) {
        res.status(400).send("invalid log in  details")

    }

})





app.listen(port, () => {
    console.log(`live srever ${port}`)
})