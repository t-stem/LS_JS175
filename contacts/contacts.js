const express = require('express');
const morgan = require('morgan');
const app = express();

const PORT = 3000;

const NAME_FIELD_MAX_CHARS = 25;
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

const stringContainsOnlyAlphabetic = (str) => {
  return /^[A-Za-z]+$/.test(str);
}

const phoneNumberMeetsFormat = (phoneNumber) => {
  return PHONE_NR_FORMAT.test(phoneNumber);
}

const trimContactTextFields = (request, response, next) => {
  const trimUserInputIfText = (fieldName) => {
    if (typeof request.body[fieldName] === 'string') {
      request.body[fieldName] = request.body[fieldName].trim();
    }
  }
  
  let requestFieldNames = Object.keys(request.body);
  requestFieldNames.forEach(fieldName => trimUserInputIfText(fieldName));

  next();
}

const validateFirstName = (request, response, next) => {
  let errorMessagesArr = response.locals.errorMessagesArr;
  
  if (!request.body.hasOwnProperty('firstName')) {
    errorMessagesArr.push('First name property does not exist');
    return next();
  } 
  let firstName = request.body.firstName;

  if (firstName.length === 0) {
    errorMessagesArr.push('First name is required');
    return next();
  }

  if (firstName.length > NAME_FIELD_MAX_CHARS) {
    errorMessagesArr.push(`First name character limit: ${NAME_FIELD_MAX_CHARS}`)
  }

  if (!stringContainsOnlyAlphabetic(firstName)) {
    errorMessagesArr.push(`First name cannot contain non-alphanumeric characters`)
  }

  next();
}

const validateLastName = (request, response, next) => {
  let errorMessagesArr = response.locals.errorMessagesArr;
  
  if (!request.body.hasOwnProperty('lastName')) {
    errorMessagesArr.push('Last name property does not exist');
    return next();
  }

  let lastName = request.body.lastName;

  if (lastName.length === 0) {
    errorMessagesArr.push('Last name is required');
    return next();
  }

  if (lastName.length > NAME_FIELD_MAX_CHARS) {
    errorMessagesArr.push(`Last name character limit: ${NAME_FIELD_MAX_CHARS}`);
  }

  if (!stringContainsOnlyAlphabetic(lastName)) {
    errorMessagesArr.push(`Last name cannot contain non-alphanumeric characters`);
  }

  next();
}

const validatePhoneNumber = (request, response, next) => {
  let errorMessagesArr = response.locals.errorMessagesArr;
  
  if (!request.body.hasOwnProperty('phoneNumber')) {
    errorMessagesArr.push('Phone number property doesn not exist');
    return next();
  }

  let phoneNumber = request.body.phoneNumber;

  if (phoneNumber.length === 0) {
    errorMessagesArr.push('Phone number is required');
    return next();
  }

  if (!phoneNumberMeetsFormat(phoneNumber)) {
    errorMessagesArr.push('Phone number must be formatted as follows: ###-###-####');
  }

  next();
};

const createFullName = (firstName, lastName) => {
  return `${firstName} ${lastName}`;
};

const extractNameFromContact = (contact) => {
  return createFullName(contact.firstName, contact.lastName);
};

const contactNameMatchesLookupName = (contact, lookupName) => {
  let contactName = extractNameFromContact(contact);

  return contactName === lookupName;
};

const fullNameIsUnique = (lookupName) => {
  return !contactData.some(contact => contactNameMatchesLookupName(contact, lookupName));
}

const validateNameUniqueness = (request, response, next) => {
  let errorMessagesArr = response.locals.errorMessagesArr;
  if (errorMessagesArr.length > 0) return next();
  
  let requestedFullName = createFullName(request.body.firstName, request.body.lastName);

  if (!fullNameIsUnique(requestedFullName)) {
    errorMessagesArr.push(`A contact named ${requestedFullName} exists already`);
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
    ...(viewVarsObj || {}),
    contacts: sortContacts(contactData)
  };

  response.render("contacts", varsToTemplate);
}

app.get("/contacts", (request, response) => { // this arrow function syntax is necessary to prevent app.get from calling renderNewContact with a 'next' argument
  renderContacts(request, response);
});

const renderNewContact = (request, response) => {
  let varsToTemplate = {
    errorMessages: response.locals.errorMessagesArr || [], // assigns an empty array if response.locals.errorMessagesArr doesn't exist
    ...(request.body || {})
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
  validateNameUniqueness,
  validatePhoneNumber,
  renderErrorMessages,
  createContact,
  redirectToContacts
);

const logListening = () => console.log(`Listening to port: ${PORT}`);
app.listen(PORT, "localhost", logListening);