const express = require('express');
const morgan = require('morgan');

const app = express();

const PORT = 3000;

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static('public'));
app.use(morgan("common"));

const englishVars = {englishClass: "current"};
const frenchVars = {frenchClass: "current"};
const japaneseVars = {japaneseClass: "current"};
const serbianVars = {serbianClass: "current"};
const renderEnglishView = (request, response) => response.render("hello-world-english", englishVars);
const renderFrenchView = (request, response) => response.render("hello-world-french", frenchVars);
const renderSerbianView = (request, response) => response.render("hello-world-serbian", serbianVars);
const renderJapaneseView = (request, response) => response.render("hello-world-japanese", japaneseVars);

app.get("/", renderEnglishView);
app.get("/english", renderEnglishView);
app.get("/french", renderFrenchView);
app.get("/serbian", renderSerbianView);
app.get("/japanese", renderJapaneseView);

const logPortNumber = () => console.log(`Listening on port: ${PORT}`);
app.listen(PORT, "localhost", logPortNumber);