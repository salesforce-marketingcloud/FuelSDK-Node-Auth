/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

const assert = require('assert');
const FuelAuth = require('../lib/fuel-auth');
const nock = require('nock');

let AuthClient;
let sampleData;

beforeEach(() => {
	AuthClient = new FuelAuth({
		clientId: 'test',
		clientSecret: 'test',
		authUrl: 'http://127.0.0.1:3000/v1/requestToken'
	});

	sampleData = {
		accessToken: '<accessToken>',
		expiresIn: 1
	};
});

describe('invalidateToken', () => {
	beforeEach(() => {
		nock('http://127.0.0.1:3000')
			.post('/v1/requestToken')
			.reply(200, sampleData);
	});

	it('should set clients token  to undefined after invalidateToken is called on the existing access token', () => {
		return AuthClient._requestToken().then(data => {
			assert.strictEqual(data.accessToken, sampleData.accessToken);
			assert.strictEqual(AuthClient.accessToken, sampleData.accessToken);

			AuthClient.invalidateToken(data.accessToken);
			assert.strictEqual(AuthClient.accessToken, undefined);
		});
	});

	it('should not set clients token to undefined after invalidateToken is called with invalid arguments', () => {
		return AuthClient._requestToken().then(data => {
			assert.strictEqual(data.accessToken, sampleData.accessToken);
			assert.strictEqual(AuthClient.accessToken, sampleData.accessToken);

			AuthClient.invalidateToken('foo');
			assert.strictEqual(AuthClient.accessToken, sampleData.accessToken);
		});
	});

	it('should throw type error when called with non-string arguments', () => {
		return AuthClient._requestToken().then(data => {
			assert.strictEqual(data.accessToken, sampleData.accessToken);
			assert.strictEqual(AuthClient.accessToken, sampleData.accessToken);
			assert.throws(AuthClient.invalidateToken, TypeError);

			// ensure token did not change
			assert.strictEqual(AuthClient.accessToken, sampleData.accessToken);
		});
	});
});
