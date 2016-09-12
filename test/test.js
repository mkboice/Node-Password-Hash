'use strict';

const spawn = require('child_process').spawn;
const expect = require('chai').expect;
const reqPromise = require('request-promise');
const BPromise = require('bluebird');

let server;
let parmMap;

beforeEach(function () {
    server = spawn('node', ['index.js']);

    server.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    server.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });
    server.on('close', (code) => {
        console.log(`Server exited with code ${code}`);
    });

    parmMap = new Map();
    parmMap.set('angryMonkey1', 'ea7KzzR5nQ70wpEAzVNokIf0LGbkd9/MhBSIelTDfA9NObui2QIgceeGtmWfXbMAWlm+c2OwecXkyGq2UYrZsA==');
    parmMap.set('angryMonkey2', 'k9w4qLUoXzJEUp6TXTL59Vhjq1g600F0Va9v/VLkNeegC7Oro7kh/AIMU20+RlnG4fBDdfmv9qY4NHc5rF7YTw==');
    parmMap.set('angryMonkey3', '+OKDXmFdy5f2WBlJlxckDJpZPho0vEhMs6h5luF5fCOKqnFTluWQdDU2eMoPfkDNbh+tI7ANiSjFIwFD8wDcbA==');
    parmMap.set('angryMonkey4', 'Duf91M0fDpdiiHy6SAywd73DO5CzrP7oje22CVFirtsvsEiOFmHzOwVU4KtIMkc+o+R6CMkQmzQZP7sk1v3GCA==');
    parmMap.set('angryMonkey5', 'vCbjnVxiigKAUMGqbxwqnz+DmpgBXzzVa4MqZxfa2aqU86PUQk9w+OKbcWgCTXf/jY4WOcd4FZJ4UVgA/QHDtA==');
    parmMap.set('angryMonkey6', 'vw8o2LrfBLsqr9jaiuc/FkJSCYONMYCFr56v7XWNy2aHxqVEMcQijCkrs/i0qBUv8iFF51jm4egqKnpJGe+MCQ==');
    parmMap.set('angryMonkey7', 'i41RCw0m/IJ7ckxXooRbX+ObZmRmTreiAjTiYHtjroupmmoh4QRMltqW7YVdqL7Tp8vG+O14xQo/rGIgc110/A==');
    parmMap.set('angryMonkey8', 'qOv9p4pA1cv2hp4g0wK0oD1s5zTfYC6SpMHLNj67wy80Q4OvS7652gHAd6rzEqhLwQrAyt7XcumPH+hvkayOqg==');
    parmMap.set('angryMonkey9', 'sI/rVFw+SW9s6GyAzHAjBGRiDXC6Obb1JQaDFy6PqzCm/PGBj4IP3iCCMzStN5n3STjols+Rd4W23J/tUSsrdw==');
    parmMap.set('angryMonkey10', 'GA9DcY33Z0GhSTI/55wdSmjmpFA6ttkgFP+OxUgvtRgt1NjtHxGECCtE+AsQxSafLkUFBVe0Gu/qWP2pnOMq0g==');

    return BPromise.delay(1000);
});

afterEach(function () {
    server.kill();
});

describe('Node Password Hasher', ()=> {

    it('should return status code 404 on a GET', function () {
        this.timeout(7000);
        const startTime = Date.now();

        return reqPromise('http://localhost:8080')
            .catch((err) => {
                const endTime = Date.now();
                expect(err.statusCode).to.be.equal(404);
                expect(err.error).to.be.equal('Not Found');
                expect(endTime - startTime).to.be.below(5000);
            });
    });

    it('should return status code 400 if incorrect form parameter is given in POST', function () {
        this.timeout(7000);
        const reqOptions = {
            method: 'POST',
            uri: 'http://localhost:8080',
            form: {pass: 'angryMonkey'}
        };
        const startTime = Date.now();

        return reqPromise(reqOptions)
            .catch((err) => {
                const endTime = Date.now();
                expect(err.statusCode).to.be.equal(400);
                expect(err.error).to.be.equal('Bad form parameter: pass=angryMonkey');
                expect(endTime - startTime).to.be.below(5000);
            });
    });

    it('should hash a given password after 5 seconds', function () {
        this.timeout(7000);
        const reqOptions = {
            method: 'POST',
            uri: 'http://localhost:8080',
            form: {password: 'angryMonkey'}
        };
        const startTime = Date.now();

        return reqPromise(reqOptions)
            .then((body) => {
                const endTime = Date.now();
                console.log(`Client received: ${body}`);
                expect(body).to.be.equal('ZEHhWB65gUlzdVwtDQArEyx+KVLzp/aTaRaPlBzYRIFj6vjFdqEb0Q5B8zVKCZ0vKbZPZklJz0Fd7su2A+gf7Q==');
                expect(endTime - startTime).to.be.above(5000);
            });
    });

    it('should handle parallel requests to hash a given password', function (done) {
        this.timeout(17000);

        let parallelReqs = [];

        parmMap.forEach((value, key) => {
            let reqOptions = {
                method: 'POST',
                uri: 'http://localhost:8080',
                form: {password: key}
            };
            //Random number between 1-5 inclusive
            const randNum = Math.floor(Math.random() * 6);
            parallelReqs.push(
                BPromise.delay(randNum * 1000)
                    .then(() => {
                        const startTime = Date.now();
                        return reqPromise(reqOptions)
                            .then((body) => {
                                const endTime = Date.now();
                                console.log(`Client received: ${body}`);
                                expect(body).to.be.equal(value);
                                expect(endTime - startTime).to.be.above(5000);
                            })
                    })
            );
        });

        BPromise.all(parallelReqs)
            .then(() => {
                console.log('All reqs finished');
                done();
            });

    });

    it('should stop accepting new requesting on "graceful shutdown"', function (done) {
        this.timeout(17000);

        let parallelReqs = [];

        parmMap.forEach((value, key) => {
            let reqOptions = {
                method: 'POST',
                uri: 'http://localhost:8080',
                form: {password: key}
            };
            //Random number between 1-5 inclusive
            const randNum = Math.floor(Math.random() * 6);
            parallelReqs.push(
                BPromise.delay(randNum * 1000)
                    .then(() => {
                        const startTime = Date.now();
                        return reqPromise(reqOptions)
                            .then((body) => {
                                const endTime = Date.now();
                                console.log(`Client received: ${body}`);
                                expect(body).to.be.equal(value);
                                expect(endTime - startTime).to.be.above(5000);
                            })
                    })
            );
        });

        BPromise.any(parallelReqs)
            .then(() => {
                server.kill();
                console.log('Killing Server');
            })
            .then(() => {
                /* Do another POST that should fail with a RequestError */
                let reqOptions = {
                    method: 'POST',
                    uri: 'http://localhost:8080',
                    form: {password: 'rejectedPassword'}
                };
                const startTime = Date.now();
                return reqPromise(reqOptions)
                    .catch((err) => {
                        const endTime = Date.now();
                        expect(err.name).to.be.equal("RequestError");
                        expect(endTime - startTime).to.be.below(5000);
                    });
            })
            .then(() => {
                return BPromise.all(parallelReqs)
                    .then(() => {
                        console.log('All reqs finished');
                        done();
                    });
            });
    });
});
