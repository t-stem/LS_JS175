const express = require('express');
const morgan = require('morgan');
const app = express();

const PORT = 3000;

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

const sortContacts = contacts => {
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

app.set("views", './views');
app.set("view engine", "pug");

app.use(express.static("public")); // checks whether requested static assets exists in /public and serves it if it does
app.use(express.urlencoded({ extended: false})); // needed to decode data from body of html requests
app.use(morgan("common")); // logs http requests to the terminal

const trimContactTextFields = (request, response, next) => {
  const trimUserInputIfText = (fieldName) => {
    if (typeof request.body[fieldName] === 'string') {
      request.body[fieldName] = request.body[fieldName].trim();
    }
  }
  
  let requestFieldNames = Object.keys(request.body);
  requestFieldNames.forEach(fieldName => trimUserInputIfText);

  next();
}

const validateFirstName = (request, response, next) => {
  if (!request.body.hasOwnProperty('firstName')) {
    response.locals.errorMessagesArr.push('First name property does not exist');
    return next();
  } 
  
  request.body.firstName = request.body.firstName.trim();

  if (request.body.firstName.length === 0) {
    response.locals.errorMessagesArr.push('First name is required');
  }

  next();
}

const validateLastName = (request, response, next) => {
  if (!request.body.hasOwnProperty('lastName')) {
    response.locals.errorMessagesArr.push('Last name property does not exist');
    return next();
  }

 request.body.firstName = request.body.lastName.trim();

  if (request.body.lastName.length === 0) {
    response.locals.errorMessagesArr.push('Last name is required');
  }

  next();
}

const validatePhoneNumber = (request, response, next) => {
  if (!request.body.hasOwnProperty('phoneNumber')) {
    response.locals.errorMessagesArr.push('Phone number property doesn not exist');
    return next();
  }

request.body.firstName = request.body.phoneNumber.trim();

  if (request.body.phoneNumber.length === 0) {
    response.locals.errorMessagesArr.push('Phone number is required');
  }

  next();
}

const responseHasErrors = (response) => {
  if (!Object.hasOwn(response.locals, 'errorMessagesArr')) return false; // response.locals doesn't inherit from Object.prototype. It's prototype is null. Therefore, it doesn't inherit .hasOwnProperty, so we use this alternative instead.
  if (!Array.isArray(response.locals.errorMessagesArr)) return false;
  if (response.locals.errorMessagesArr.length === 0) return false;
  return true;
};

const renderErrorMessages = (request, response, next) => {
  if (responseHasErrors(response)) {
    renderNewContact(request, response);
  } else {
    next();
  }
}

const createContact = (request, response, next) => {
  let newContact = {
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    phoneNumber: request.body.phoneNumber
  } 
  
  contactData.push(newContact);

  next();
}

const redirectToContacts = (request, response) => response.redirect("/contacts");

app.get("/", redirectToContacts);

const renderContacts = (request, response, viewVarsObj) => {
  let varsToTemplate = {
    ...viewVarsObj,
    contacts: sortContacts(contactData)
  };

  response.render("contacts", varsToTemplate);
}

app.get("/contacts", (request, response) => { // this arrow function syntax is necessary to prevent app.get from calling renderNewContact with a 'next' argument
  renderContacts(request, response);
});

const renderNewContact = (request, response) => {
  let varsToTemplate = {
    errorMessages: response.locals.errorMessagesArr || [] // assigns an empty array if response.locals.errorMessagesArr doesn't exist
  };
  
  response.render("new-contact-form", varsToTemplate)
};

app.get("/contacts/new", (request, response) => { // this arrow function syntax is necessary to prevent app.get from calling renderNewContact with a 'next' argument
  renderNewContact(request, response); 
});

const postNewContactForm = (request, response, next) => {
  response.locals.errorMessagesArr = [];
  next();
}

app.post("/contacts/new", 
  postNewContactForm,
  trimContactTextFields,
  validateFirstName,
  validateLastName,
  validatePhoneNumber,
  renderErrorMessages,
  createContact,
  redirectToContacts
);

const logListening = () => console.log(`Listening to port: ${PORT}`);
app.listen(PORT, "localhost", logListening);