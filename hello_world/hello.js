const EXPRESS = require('express');
const APP = EXPRESS();

const PORT = 3000;

APP.set("views", "./views");
APP.set("view engine", "pug");

APP.use(EXPRESS.static('public'));

const writeLog = (request, response) => {
  let timeStamp = String(new Date()).substring(4, 24);
  console.log(`${timeStamp} ${request.method} ${request.originalUrl} ${response.statusCode}`);
};

const renderView = (request, response, view) => {
  response.render(view);
  writeLog(request, response);
};

const renderEnglishView = (request, response) => renderView(request, response, "hello-world-english");
const renderFrenchView = (request, response) => renderView(request, response, "hello-world-french");
const renderSerbianView = (request, response) => renderView(request, response, "hello-world-serbian");
const renderJapaneseView = (request, response) => renderView(request, response, "hello-world-japanese");

APP.get("/", renderEnglishView);
APP.get("/english", renderEnglishView);
APP.get("/french", renderFrenchView);
APP.get("/serbian", renderSerbianView);
APP.get("/japanese", renderJapaneseView);

let logPortNumber = () => console.log(`Listening on port: ${PORT}`);
APP.listen(PORT, "localhost", logPortNumber);