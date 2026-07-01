const HTTP = require('http');
const URL = require('url').URL;
const HANDLEBARS = require('handlebars');
const PATH = require('path');
const FS = require('fs');
const QUERYSTRING = require('querystring');

const MIME_TYPES = {
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const SCHEME = 'http';
const HOST = 'localhost';
const PORT = 3000;

const LOAN_FORM_SOURCE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Loan Calculator</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <form action="/loan-offer" method="post">
        <p>All loans are offered at an APR of {{apr}}%.</p>
        <label for="amount">How much do you want to borrow (in dollars)?</label>
        <input type="number" name="amount" id="amount" value="">
        <label for="duration">How much time do you want to pay back your loan?</label>
        <input type="number" name="duration" id="duration" value="">
        <input type="submit" name="" value="Get loan offer!">
      </form>
    </article>
  </body>
</html>`;

const LOAN_OFFER_SOURCE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Loan Calculator</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <table>
        <tbody>
          <tr>
            <th>Amount:</th>
            <td>
              <a href='/loan-offer?amount={{principalDecrement}}&duration={{durationInYears}}'>- $100</a>
            </td>
            <td>$ {{principal}}</td>
            <td>
              <a href='/loan-offer?amount={{principalIncrement}}&duration={{durationInYears}}'>+ $100</a>
            </td>
          </tr>
          <tr>
            <th>Duration:</th>
            <td>
              <a href='/loan-offer?amount={{principal}}&duration={{durationInYearsDecrement}}'>- 1 year</a>
            </td>
            <td>{{durationInYears}} years</td>
            <td>
              <a href='/loan-offer?amount={{principal}}&duration={{durationInYearsIncrement}}'>+ 1 year</a>
            </td>
          </tr>
          <tr>
            <th>APR:</th>
            <td colspan='3'>{{apr}}%</td>
          </tr>
          <tr>
            <th>Monthly payment:</th>
            <td colspan='3'>$ {{monthlyPayment}}</td>
          </tr>
        </tbody>
      </table>
    </article>
  </body>
</html>
`;

const LOAN_OFFER_TEMPLATE = HANDLEBARS.compile(LOAN_OFFER_SOURCE);
const LOAN_FORM_TEMPLATE = HANDLEBARS.compile(LOAN_FORM_SOURCE);

const APR = 0.05;
const MIN_PRINCIPAL = 0;
const MIN_DURATION_YEARS = 1;

const VALIDATED_INVALID = 'INVALID';

function validatePrincipal(principal) {
  if (principal === null) return MIN_PRINCIPAL;
  
  principal = Number(principal);
  if (Number.isNaN(principal)) return VALIDATED_INVALID;
  if (principal < MIN_PRINCIPAL) return VALIDATED_INVALID;
  
  return principal;
}

function validateDurationInYears(durationInYears) {
  if (durationInYears === null) return MIN_DURATION_YEARS;
  
  durationInYears = Number(durationInYears);
  if (Number.isNaN(durationInYears)) return VALIDATED_INVALID;
  if (durationInYears < MIN_DURATION_YEARS) return VALIDATED_INVALID;
  
  return durationInYears;
}

function validateParams(params) {
  let principal = params.amount;
  let durationInYears = params.duration;

  return [validatePrincipal(principal), validateDurationInYears(durationInYears)];
}

function areAllArgsValid(...args) {
  return !args.includes(VALIDATED_INVALID);
}

function calcMonthlyPayment(principal, monthlyInterestRate, durationInMonths) {
  let monthlyPayment = principal * (monthlyInterestRate / (1 - (1 + monthlyInterestRate) ** (-durationInMonths)));
  return monthlyPayment.toFixed(2);
}

function aprToFixed() {
  return `${(APR * 100).toFixed(2)}`;
}

function createLoanOffer(params) {
  const MONTHLY_INTEREST_RATE = APR / 12;
  const DELTA_PRINCIPAL = 100;
  const DELTA_DURATION_YEARS = 1;
  let offerData = {};

  offerData.apr = aprToFixed();

  let [principal, durationInYears] = validateParams(params);

  offerData.principal = principal;
  offerData.principalDecrement = principal === VALIDATED_INVALID ? MIN_PRINCIPAL : principal - DELTA_PRINCIPAL;
  offerData.principalIncrement = principal === VALIDATED_INVALID ? MIN_PRINCIPAL : principal + DELTA_PRINCIPAL;

  offerData.durationInYears = durationInYears;
  offerData.durationInYearsDecrement = durationInYears === VALIDATED_INVALID ? MIN_DURATION_YEARS : durationInYears - DELTA_DURATION_YEARS;
  offerData.durationInYearsIncrement = durationInYears === VALIDATED_INVALID ? MIN_DURATION_YEARS : durationInYears + DELTA_DURATION_YEARS;
  
  let durationInMonths = durationInYears * 12;
  offerData.monthlyPayment  = areAllArgsValid(principal, durationInYears) ? calcMonthlyPayment(principal, MONTHLY_INTEREST_RATE, durationInMonths) : VALIDATED_INVALID;

  return offerData;
}

function renderTemplateHTML(template, data) {
  let html = template(data);
  return html;
}

function parseFormData(request, callback) {
  let body = '';
    request.on('data', chunk => {
      body += chunk.toString();
    });
    request.on('end', () => {
      let data = QUERYSTRING.parse(body);
      data.amount = Number(data.amount);
      data.duration = Number(data.duration);
      callback(data);
    });
};

const SERVER = HTTP.createServer((req, res) => {  
  let method = req.method;
  let path = req.url;
  let url = new URL(path, `${SCHEME}://${HOST}:${PORT}`);
  let pathName = url.pathname;
  let fileExtension = PATH.extname(pathName);
  let resContent;

  FS.readFile(`./public${pathName}`, (err, fileData) => {
    if (fileData) {

      res.statusCode = 200;
      res.setHeader('Content-Type', MIME_TYPES[fileExtension]);
      resContent = fileData;

    } else if (pathName === '/loan-offer' && method === 'GET') {

      let params = url.searchParams;
      params = {
        amount: params.get('amount'),
        duration: params.get('duration')
      };
      
      let offerData = createLoanOffer(params);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      resContent = renderTemplateHTML(LOAN_OFFER_TEMPLATE, offerData);
    
    } else if (pathName === '/loan-offer' && method === 'POST') {

      parseFormData(req, (parsedData) => {
        let offerData = createLoanOffer(parsedData);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        resContent = renderTemplateHTML(LOAN_OFFER_TEMPLATE, offerData);
        res.write(resContent); // because parseFormData is asynchronous, the writing and ending are needed here (otherwise the program moves on while parseFormData is still running asynchronously)
        res.end();
      });

      return; // early return to avoid double writing/ending

    } else if (pathName === '/' && method === 'GET') {

      let data = {
        apr: aprToFixed()
      }
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      resContent = renderTemplateHTML(LOAN_FORM_TEMPLATE, data);

    } else {

      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      resContent = '404 Not Found';
      
    }

  res.write(resContent); 
  res.end();

  });
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
});