"use strict";
const http = require('http');
const crypto = require('crypto');
const url = require('url');

const PORT=8080;

function handlePasswordHash(req, res) {
  if(req.method === 'POST' && req.url === '/') {
      let body = [];
      req.on('data', (part) => {
          body.push(part);
      }).on('end', () => {
          const bodyString = Buffer.concat(body).toString();
          console.log(`Server received: ${bodyString}`);
          const formElements = bodyString.split(/[=&]+/);
          const parameter = formElements[0];
          const password = formElements[1];
          if(parameter !== 'password' || password === '' || formElements.length > 2) {
              res.statusCode = 400;
              res.end(`Bad form parameter: ${bodyString}`);
          }
          else {
              setTimeout(() => {
                  res.statusCode = 200;
                  res.end(crypto.createHash('sha512').update(password).digest('base64'));
              }, 5000);
          }
      });
  }
  else {
      res.statusCode = 404;
      res.end('Not Found');
  }
}

function gracefulShutdown() {
    console.log("Shutting down gracefully");
    server.close(() => {
        console.log('All connections closed');
        process.exit(0);
    })
}

const server = http.createServer(handlePasswordHash);

server.listen(PORT, () => {
  console.log(`Server listening on: http://localhost:${PORT}`);
});

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
