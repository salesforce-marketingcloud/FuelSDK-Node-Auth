/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */
'use strict';

const assert = require('assert');
const FuelAuth = require('../lib/fuel-auth');
const sinon = require('sinon');

let AuthClient;
let sampleData;
let sampleOptions;

beforeEach(() => {
	sampleData = { data: true };
	sampleOptions = { options: true };

	AuthClient = new FuelAuth({
		clientId: 'test',
		clientSecret: 'test',
		authUrl: 'http://127.0.0.1:3000/v1/requestToken'
	});
});

describe('_processRequest', () => {
	it('should get a new token', done => {
		const getNewToken = true;
		const requestSpy = sinon.stub(AuthClient, '_requestToken').callsFake(() => {
			return new Promise(resolve => resolve(sampleData));
		});

		AuthClient._processRequest(getNewToken, sampleOptions, (err, data) => {
			assert.strictEqual(requestSpy.calledOnce, true, '_requestToken should only be called once');
			assert.strictEqual(requestSpy.calledWith(sampleOptions), true, '_requestToken should be passed options');
			assert.strictEqual(err, null);
			assert.deepEqual(data, sampleData);
			done();
		});
	});

	it('should handle error when trying to get new token', done => {
		const getNewToken = true;
		const requestSpy = sinon.stub(AuthClient, '_requestToken').callsFake(() => {
			return new Promise((resolve, reject) => {
				reject(sampleData);
			});
		});

		AuthClient._processRequest(getNewToken, sampleOptions, (err, data) => {
			assert.strictEqual(requestSpy.calledOnce, true, '_requestToken should only be called once');
			assert.strictEqual(requestSpy.calledWith(sampleOptions), true, '_requestToken should be passed options');
			assert.strictEqual(data, null, 'data should be null');
			assert.deepEqual(err, sampleData, 'err received should deep equal error data');
			done();
		});
	});

	it('should return cached data', done => {
		const getNewToken = false;
		const requestSpy = sinon.stub(AuthClient, '_requestToken');

		AuthClient.accessToken = '<accessToken>';
		AuthClient.expiration = 0;

		AuthClient._processRequest(getNewToken, null, (err, data) => {
			assert.equal(requestSpy.called, false, '_requestToken should not have been called');
			assert.strictEqual(err, null, 'error should be null if we have cached data');
			assert.equal(data.accessToken, AuthClient.accessToken, 'should return cached token');
			assert.equal(data.expiresIn < 0, true, 'expires should be less than 0 in this case');
			done();
		});
	});
});
