/*
 * Copyright (c) 2015, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
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
