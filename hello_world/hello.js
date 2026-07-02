const EXPRESS = require('express');
const APP = EXPRESS();

const PORT = 3000;

APP.set("views", "./views");
APP.set("view engine", "pug");

APP.use(EXPRESS.static('public'));

const renderEnglishView = (request, response) => response.render("hello-world-english");
const renderFrenchView = (request, response) => response.render("hello-world-french");
const renderSerbianView = (request, response) => response.render("hello-world-serbian");
const renderJapaneseView = (request, response) => response.render("hello-world-japanese");

APP.get("/", renderEnglishView);
APP.get("/english", renderEnglishView);
APP.get("/french", renderFrenchView);
APP.get("/serbian", renderSerbianView);
APP.get("/japanese", renderJapaneseView);

let logPortNumber = () => console.log(`Listening on port: ${PORT}`);
APP.listen(PORT, "localhost", logPortNumber);