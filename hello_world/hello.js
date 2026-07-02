const express = require('express');
const morgan = require('morgan');

const app = express();

const PORT = 3000;

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static('public'));
app.use(morgan("common"));

app.locals.currentClassForRequestedPath = (navPath, requestedPath) => navPath === requestedPath ? "current" : "";

const renderView = ({viewName, language}) => {
  return (request, response) => {
    let viewVars = {
      requestedPath: request.path,
      language: language
    };

    response.render(viewName, viewVars);
  }
};

const englishViewArgs = {viewName: "hello-world-english", language: "en-US"};
const frenchViewArgs = {viewName: "hello-world-french", language: "fr-FR"};
const japaneseViewArgs = {viewName: "hello-world-japanese", language: "ja-JP"};
const serbianViewArgs = {viewName: "hello-world-serbian", language: "sr-Cyrl-rs"};

const renderEnglishView = renderView(englishViewArgs);
const renderFrenchView = renderView(frenchViewArgs);
const renderJapaneseView = renderView(japaneseViewArgs);
const renderSerbianView = renderView(serbianViewArgs);

const redirectToEnglishView = (request, response) => response.redirect("/english");

app.get("/", redirectToEnglishView);
app.get("/english", renderEnglishView);
app.get("/french", renderFrenchView);
app.get("/serbian", renderSerbianView);
app.get("/japanese", renderJapaneseView);

const logPortNumber = () => console.log(`Listening on port: ${PORT}`);
app.listen(PORT, "localhost", logPortNumber);