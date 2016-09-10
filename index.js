"use strict";
const http = require('http');
const crypto = require('crypto');

const PORT=8080;

function handleRequest(req, res) { 
  if(req.method === 'POST') {
      let body = [];
      req.on('data', (part) => {
          body.push(part);
      }).on('end', () => {
          const bodyString = Buffer.concat(body).toString();
          console.log(`Server received: ${bodyString}`);
          const parts = bodyString.split('=');
          const parameter = parts[0];
          const password = parts[1];
          if(parameter !== 'password') {
              res.statusCode = 400;
              res.end(`Bad form parameter: ${parameter}`);
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

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`Server listening on: http://localhost:${PORT}`);
});

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
