const express = require('express');
const morgan = require('morgan');

const app = express();

const PORT = 3000;

const COUNTRY_DATA = [
  {
    path: "/english",
    flag: "flag-of-USA.png",
    alt: "US Flag",
    title: "Go to US English website"
  },
  {
    path: "/french",
    flag: "flag-of-France.png",
    alt: "Drapeau de la France",
    title: "Aller sur le site français"
  },
  {
    path: "/japanese",
    flag: "flag-of-Japan.png",
    alt: "日本の国旗",
    title: "日本語版ページを見る"
  },
  {
    path: "/serbian",
    flag: "flag-of-Serbia.png",
    alt: "Застава Србије",
    title: "Идите на српски сајт"
  },
];

const LANGUAGE_CODES = {
  english: "en-US",
  french: "fr-FR",
  japanese: "ja-JP",
  serbian: "sr-Cryl-rs",
}

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static('public'));
app.use(morgan("common"));

app.locals.currentClassForRequestedPath = (navPath, requestedPath) => navPath === requestedPath ? "current" : "";

const redirectToEnglishView = (request, response) => response.redirect("/english");

const validateRequest = (request) => {
  let language = request.params.language;

  return LANGUAGE_CODES[language] ? true : false;
}

const renderView = (request, response) => {
  let language = request.params.language;

  let viewName = `hello-world-${language}`;

  let viewVars = {
    countries: COUNTRY_DATA,
    language: LANGUAGE_CODES[language],
    requestedPath: request.path
  };

  response.render(viewName, viewVars);
};

const handleError = (request, response, next) => {
  let language = request.params.language;
  let error = new Error(`Language not supported: ${language}`);
  
  next(error);
}

const handleRequest = (request, response, next) => {

  if (validateRequest(request)) {
    
    renderView(request, response);
  
  } else {
    
    handleError(request, response, next);
  }
}

const errorHandler = (error, request, response, _next) => {
  console.log(error);
  response.status(404).send(error.message);
}

app.get("/", redirectToEnglishView);
app.get("/:language", handleRequest);

const logPortNumber = () => console.log(`Listening on port: ${PORT}`);

app.use(errorHandler);
app.listen(PORT, "localhost", logPortNumber);