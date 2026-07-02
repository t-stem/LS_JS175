const express = require('express');
const morgan = require('morgan');
const app = express();

const PORT = 3000;

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static('public'));
app.use(morgan("common"));

const renderEnglishView = (request, response) => response.render("hello-world-english");
const renderFrenchView = (request, response) => response.render("hello-world-french");
const renderSerbianView = (request, response) => response.render("hello-world-serbian");
const renderJapaneseView = (request, response) => response.render("hello-world-japanese");

app.get("/", renderEnglishView);
app.get("/english", renderEnglishView);
app.get("/french", renderFrenchView);
app.get("/serbian", renderSerbianView);
app.get("/japanese", renderJapaneseView);

let logPortNumber = () => console.log(`Listening on port: ${PORT}`);
app.listen(PORT, "localhost", logPortNumber);