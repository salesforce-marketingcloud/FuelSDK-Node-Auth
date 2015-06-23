/**
 * Copyright (c) 2015, salesforce.com, inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided
 * that the following conditions are met:
 *
 *    Redistributions of source code must retain the above copyright notice, this list of conditions and the
 *    following disclaimer.
 *
 *    Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
 *    the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 *    Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
 *    promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

var assert   = require('assert');
var FuelAuth = require('../../lib/fuel-auth');
var nock     = require('nock');
var Promise  = (typeof Promise === 'undefined') ? require('bluebird') : Promise;

var AuthClient;
var sampleData;

beforeEach(function() {
	AuthClient = new FuelAuth({
		clientId: 'test'
		, clientSecret: 'test'
		, authUrl: 'http://127.0.0.1:3000/v1/requestToken'
	});

	sampleData = {
		accessToken: '<accessToken>',
		expiresIn: 1
	};
});

describe('_requestToken', function() {
	it('should return data on successful call to API', function(done) {
		// this means 200, 404, 400, etc
		nock('http://127.0.0.1:3000')
			.post('/v1/requestToken')
			.reply(200, sampleData);

		AuthClient
			._requestToken()
			.then(function(data) {
				assert.strictEqual(data.accessToken, sampleData.accessToken);
				assert.strictEqual(AuthClient.accessToken, sampleData.accessToken);
				assert.strictEqual(data.expiresIn, 1);
				assert.strictEqual(AuthClient.expiration > 1, true);
				done();
			})
			.catch(function(err) {
				done(err);
			});
	});

	it('should fail if request module fails', function(done) {
		// subsequently, this will test merging options as well
		AuthClient
			._requestToken({ method: 'TEST' })
			.then(function(data) {
				done(data);
			})
			.catch(function(err) {
				assert(!!err);
				done();
			});
	});

	it('should add refreshToken to json if set on client', function(done) {
		var refreshToken = '<refreshToken>';
		var calledWithRefreshToken = false;
		sampleData.refreshToken = refreshToken + '<new>';
		AuthClient.refreshToken = refreshToken;

		nock('http://127.0.0.1:3000')
			.post('/v1/requestToken')
			.reply(200, function(uri, body) {
				body = JSON.parse(body);

				if(body.refreshToken === refreshToken) {
					calledWithRefreshToken = true;
				}
				return sampleData;
			});

		AuthClient
			._requestToken()
			.then(function(data) {
				assert.equal(data.refreshToken, sampleData.refreshToken);
				assert.equal(AuthClient.refreshToken, sampleData.refreshToken);
				assert(calledWithRefreshToken);
				done();
			})
			.catch(function(err) {
				done(err);
			});
	});

	it('should add scope to json if set on client', function(done) {
		var scope = '<scope>';
		var calledWithScope = false;
		AuthClient.scope = scope;

		nock('http://127.0.0.1:3000')
			.post('/v1/requestToken')
			.reply(200, function(uri, body) {
				body = JSON.parse(body);

				if(body.scope === scope) {
					calledWithScope = true;
				}
				return sampleData;
			});

		AuthClient
			._requestToken()
			.then(function(data) {
				assert(!!data);
				assert(calledWithScope);
				done();
			})
			.catch(function(err) {
				done(err);
			});
	});

	it('should return null for access token and expiration if no provided in response payload', function(done) {
		nock('http://127.0.0.1:3000')
			.post('/v1/requestToken')
			.reply(200, {});

		AuthClient
			._requestToken()
			.then(function(data) {
				assert.strictEqual(data.accessToken, undefined);
				assert.strictEqual(AuthClient.accessToken, null);

				assert.strictEqual(data.expiresIn, undefined);
				assert.strictEqual(AuthClient.expiration , null);
				done();
			})
			.catch(function(err) {
				done(err);
			});
	});
});
