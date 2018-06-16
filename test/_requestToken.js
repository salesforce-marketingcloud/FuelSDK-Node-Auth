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

describe('_requestToken', () => {
	it('should return data on successful call to API', done => {
		// this means 200, 404, 400, etc
		nock('http://127.0.0.1:3000')
			.post('/v1/requestToken')
			.reply(200, sampleData);

		AuthClient._requestToken()
			.then(data => {
				assert.strictEqual(data.accessToken, sampleData.accessToken);
				assert.strictEqual(AuthClient.accessToken, sampleData.accessToken);
				assert.strictEqual(data.expiresIn, 1);
				assert.strictEqual(AuthClient.expiration > 1, true);
				done();
			})
			.catch(err => done(err));
	});

	it('should fail if request module fails', done => {
		// subsequently, this will test merging options as well
		AuthClient._requestToken({ method: 'TEST' })
			.then(data => done(data))
			.catch(err => {
				assert(!!err);
				done();
			});
	});

	it('should fail if request successful without body', () => {
		nock('http://127.0.0.1:3000')
			.post('/v1/requestToken')
			.reply(200);

		return AuthClient._requestToken().then(
			() => assert(false, 'Unexpected resolve'),
			err => assert.equal(err.message, 'No response body')
		);
	});

	it('should add refreshToken to json if set on client', done => {
		const refreshToken = '<refreshToken>';
		let calledWithRefreshToken = false;
		sampleData.refreshToken = refreshToken + '<new>';
		AuthClient.refreshToken = refreshToken;

		nock('http://127.0.0.1:3000')
			.filteringRequestBody(/.*/, '*')
			.post('/v1/requestToken')
			.reply(200, (uri, body) => {
				if (body.refreshToken === refreshToken) {
					calledWithRefreshToken = true;
				}
				return sampleData;
			});

		AuthClient._requestToken()
			.then(data => {
				assert.equal(data.refreshToken, sampleData.refreshToken);
				assert.equal(AuthClient.refreshToken, sampleData.refreshToken);
				assert(calledWithRefreshToken);
				done();
			})
			.catch(err => done(err));
	});

	it('should add scope to json if set on client', done => {
		const scope = '<scope>';
		let calledWithScope = false;
		AuthClient.scope = scope;

		nock('http://127.0.0.1:3000')
			.post('/v1/requestToken')
			.reply(200, (uri, body) => {
				if (body.scope === scope) {
					calledWithScope = true;
				}
				return sampleData;
			});

		AuthClient._requestToken()
			.then(data => {
				assert(!!data);
				assert(calledWithScope);
				done();
			})
			.catch(err => done(err));
	});

	it('should return null for access token and expiration if no provided in response payload', done => {
		nock('http://127.0.0.1:3000')
			.post('/v1/requestToken')
			.reply(200, {});

		AuthClient._requestToken()
			.then(data => {
				assert.strictEqual(data.accessToken, undefined);
				assert.strictEqual(AuthClient.accessToken, null);

				assert.strictEqual(data.expiresIn, undefined);
				assert.strictEqual(AuthClient.expiration, null);
				done();
			})
			.catch(err => done(err));
	});
});
