/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

const assert = require('assert');
const FuelAuth = require('../lib/fuel-auth');
const http = require('http');

const proxyPort = 8888;
const proxyErrorPort = 1234;
const proxyResponseBody = 'Hello Node JS Server Response';
const server = http.createServer(function (request, response) {
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.write(proxyResponseBody);
    response.end();
});

describe('Proxy Support', () => {
    let AuthClient, options;

    before(done => server.listen(proxyPort, done));

    beforeEach(() => {
        options = {
            clientId: 'test',
            clientSecret: 'test',
            authUrl: 'http://127.0.0.1:3000/v1/requestToken',
            proxy: {
                host: '127.0.0.1',
                protocol: 'http:'
            }
        };
    });

    it('should respond the proxyResponseBody if proxy option passed correctly', () => {
        options.proxy.port = proxyPort;
        AuthClient = new FuelAuth(options);
        return AuthClient.getAccessToken()
            .then(body => {
                assert.equal(body, proxyResponseBody);
            })
            .catch(err => {
                assert.notOk(err);
            });
    });

    it('should error if proxy option passed incorrectly', () => {
        options.proxy.port = proxyErrorPort;
        AuthClient = new FuelAuth(options);
        return AuthClient.getAccessToken()
            .then(body => {
                assert.notOk(body);
            })
            .catch(err => {
                assert.ok(err);
                assert.equal(err.code, 'ECONNREFUSED');
                assert.equal(err.port, proxyErrorPort);
            });
    });

    after(() => server.close());

});
