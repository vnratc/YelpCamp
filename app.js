const express = require("express")
const app = express()
const path = require("path")

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")


app.get("/", (req, res) => {
    res.render("home")
})


app.listen(3000, () => {
    console.log("Starting a server. Listening for connections on port 3000")
})