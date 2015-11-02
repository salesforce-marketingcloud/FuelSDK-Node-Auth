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
var FuelAuth = require('../lib/fuel-auth');
var nock     = require('nock');
var Promise  = (typeof Promise === 'undefined') ? require('bluebird') : Promise;

beforeEach(function() {
	this.AuthClient = new FuelAuth({
		clientId: 'test'
		, clientSecret: 'test'
		, authUrl: 'http://127.0.0.1:3000/v1/requestToken'
	});

	this.sampleData = {
		accessToken: '<accessToken>',
		expiresIn: 1
	};
});

describe('invalidateToken', function () {

	beforeEach(function () {
		nock('http://127.0.0.1:3000')
			.post('/v1/requestToken')
			.reply(200, this.sampleData);
	});

	it('should set clients token  to undefined after invalidateToken is called on the existing access token', function () {
		var AuthClient = this.AuthClient;
		var sampleData = this.sampleData;

		return this.AuthClient
			._requestToken()
			.then(function (data) {
				assert.strictEqual(data.accessToken, sampleData.accessToken);
				assert.strictEqual(AuthClient.accessToken, sampleData.accessToken);

				AuthClient.invalidateToken(data.accessToken);
				assert.strictEqual(AuthClient.accessToken, undefined);
			});
	});

	it('should not set clients token to undefined after invalidateToken is called with invalid arguments', function () {
		var AuthClient = this.AuthClient;
		var sampleData = this.sampleData;

		return AuthClient
			._requestToken()
			.then(function (data) {
				assert.strictEqual(data.accessToken, sampleData.accessToken);
				assert.strictEqual(AuthClient.accessToken, sampleData.accessToken);

				AuthClient.invalidateToken('foo');
				assert.strictEqual(AuthClient.accessToken, sampleData.accessToken);
			});
	});

	it('should throw type error when called with non-string arguments', function () {
		var AuthClient = this.AuthClient;
		var sampleData = this.sampleData;

		return this.AuthClient
			._requestToken()
			.then(function (data) {
				assert.strictEqual(data.accessToken, sampleData.accessToken);
				assert.strictEqual(AuthClient.accessToken, sampleData.accessToken);
				assert.throws(AuthClient.invalidateToken, TypeError);

				// ensure token did not change
				assert.strictEqual(AuthClient.accessToken, sampleData.accessToken);
			});
	});
});
