const express = require('express');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');
const session = require('express-session');
const store = require('connect-loki');
const flash = require('express-flash');

const app = express();
const LokiStore = store(session);

const PORT = 3000;

const NAME_FIELD_MAX_CHARS = 25;
const REQUIRED_FIELD_MIN_CHARS = 1;
const PHONE_NR_FORMAT = /^\d\d\d-\d\d\d-\d\d\d\d$/; /// tests whether string exactly equals ###-###-#### (not includes)

const contactData = [
  {
    firstName: "Mike",
    lastName: "Jones",
    phoneNumber: "281-330-8004",
  },
  {
    firstName: "Jenny",
    lastName: "Keys",
    phoneNumber: "768-867-5309",
  },
  {
    firstName: "Max",
    lastName: "Entiger",
    phoneNumber: "214-748-3647",
  },
  {
    firstName: "Alicia",
    lastName: "Keys",
    phoneNumber: "515-489-4608",
  },
];

const sortContacts = (contacts) => {
  return contacts.slice().sort((contactA, contactB) => {
    if (contactA.lastName < contactB.lastName) {
      return -1;
    } else if (contactA.lastName > contactB.lastName) {
      return 1;
    } else if (contactA.firstName < contactB.firstName) {
      return -1;
    } else if (contactA.firstName > contactB.firstName) {
      return 1;
    } else {
      return 0;
    }
  });
};

const cloneObj = (obj) => {
  return JSON.parse(JSON.stringify(obj)); // creates a deep copy of an object by turning it into a string first and then parsing the string back into an object
};

const cloneToDataStore = (request, response, next) => {
  if (!("contactData" in request.session)) {
    request.session.contactData = cloneObj(contactData);
  }

  next()
};

app.set("views", './views');
app.set("view engine", "pug");

const sessionProperties = {
  cookie: {
    httpOnly: true,
    maxAge: 31 * 24 * 60 * 60 * 1000, // 31 days in milliseconds
    path: "/",
    secure: false,
  },
  name: "launch-school-contacts-manager-session-id",
  resave: false,
  saveUninitialized: true,
  secret: "this is not very secure",
  store: new LokiStore({}),
};

const transferFlashToLocals = (request, response, next) => {
  response.locals.flash = request.session.flash;
  delete request.session.flash;
  next();
};

app.use(express.static("public")); // checks whether requested static assets exists in /public and serves it if it does
app.use(express.urlencoded({ extended: false})); // needed to decode data from body of html requests
app.use(morgan("common")); // logs http requests to the terminal
app.use(session(sessionProperties));
app.use(flash());
app.use(cloneToDataStore);
app.use(transferFlashToLocals);

const redirectToContacts = (request, response) => response.redirect("/contacts");

const createContact = (request, response) => {
  let newContact = {
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    phoneNumber: request.body.phoneNumber
  } 
  
  request.session.contactData.push(newContact);
  request.flash("success", "New contact added to the list!");
  redirectToContacts(request, response);
};

app.get("/", redirectToContacts);

const renderContacts = (request, response, viewVarsObj) => {
  let varsToTemplate = {
    ...(viewVarsObj || {}),
    contacts: sortContacts(request.session.contactData)
  };

  response.render("contacts", varsToTemplate);
};

app.get("/contacts", (request, response) => {
  renderContacts(request, response);
});

const renderNewContact = (request, response) => {
  let varsToTemplate = {
    ...(request.body || {})
  };
  
  response.render("new-contact-form", varsToTemplate);
};

app.get("/contacts/new", (request, response) => {
  renderNewContact(request, response); 
});

const validateName = (fieldName, fieldLabel) => {
  return body(fieldName)
    .trim()
    .isLength({min: REQUIRED_FIELD_MIN_CHARS})
    .withMessage(`${fieldLabel} is required`)
    .bail()
    .isLength({max: NAME_FIELD_MAX_CHARS})
    .withMessage(`${fieldLabel} is too long. Maximum length is ${NAME_FIELD_MAX_CHARS} characters.`)
    .isAlpha()
    .withMessage(`${fieldLabel} contains invalid characters. The name must be fully alphabetic.`)
};

const validatePhoneNumber = () => {
  return body("phoneNumber")
    .trim()
    .isLength({min: REQUIRED_FIELD_MIN_CHARS})
    .withMessage("Phone number is required")
    .bail()
    .matches(PHONE_NR_FORMAT)
    .withMessage("Invalid phone number format. Please use ###-###-####.")
};

const newContactValidationChains = [
  validateName('firstName', 'First name'),
  validateName('lastName', 'Last name'),
  validatePhoneNumber()
];

const validateContact = (request, response, next) => {
  let errors = validationResult(request);

  if (!errors.isEmpty()) {
      errors.array().forEach(error => request.flash("error", error.msg));
    
      let varsToTemplate = {
      flash: request.flash(),
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      phoneNumber: request.body.phoneNumber
    }

    response.render("new-contact-form", varsToTemplate);
  } else {
    next();
  }
}

app.post("/contacts/new", 
  newContactValidationChains,
  validateContact,
  createContact,
);

const logListening = () => console.log(`Listening to port: ${PORT}`);
app.listen(PORT, "localhost", logListening);