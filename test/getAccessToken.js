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

describe('getAccessToken', () => {
	let AuthClient;
	let sampleCb;

	beforeEach(() => {
		AuthClient = new FuelAuth({
			clientId: 'test',
			clientSecret: 'test',
			authUrl: 'http://127.0.0.1:3000/v1/requestToken'
		});

		sampleCb = () => true;
	});

	it('should throw error if callback provided is not a function', () => {
		let didThrow = false;
		let error;

		try {
			AuthClient.getAccessToken({}, 'test');
		} catch (err) {
			didThrow = true;
			error = err.message;
		}

		assert.equal(didThrow, true);
		assert.equal(error, 'argument callback must be a function');
	});

	it('should call _processRequest with provided callback and options', () => {
		const options = { test: true };
		const processRequestSpy = sinon.spy(AuthClient, '_processRequest');
		const expiredSpy = sinon.stub(AuthClient, 'isExpired').returns(true);

		AuthClient.getAccessToken(options, sampleCb);
		assert.equal(processRequestSpy.calledWith(true, options, sampleCb), true);
		assert.equal(expiredSpy.calledOnce, true);
	});

	it('should call _processRequest when only callback is provided', () => {
		const expiredSpy = sinon.stub(AuthClient, 'isExpired').returns(true);
		const processRequestSpy = sinon.spy(AuthClient, '_processRequest');

		AuthClient.getAccessToken(sampleCb);
		assert.equal(processRequestSpy.calledWith(true, {}, sampleCb), true);
		assert.equal(expiredSpy.calledOnce, true);
	});

	it('should not force new request if not expired and no option', () => {
		const processRequestSpy = sinon.spy(AuthClient, '_processRequest');

		sinon.stub(AuthClient, 'isExpired').returns(false);

		AuthClient.getAccessToken(sampleCb);
		assert.equal(processRequestSpy.calledWith(false, {}, sampleCb), true);
	});

	it('should use force option', () => {
		const processRequestSpy = sinon.spy(AuthClient, '_processRequest');

		sinon.stub(AuthClient, 'isExpired').returns(false);

		AuthClient.getAccessToken({ force: true }, sampleCb);
		assert.equal(processRequestSpy.calledWith(true, {}, sampleCb), true);
	});

	it('should use promises to deliver data', done => {
		sinon.stub(AuthClient, 'isExpired').returns(true);
		sinon.stub(AuthClient, '_processRequest', (getNewToken, options, callback) => callback(null, {}));

		AuthClient.getAccessToken()
			.then(data => {
				assert.equal(!!data, true);
				done();
			})
			.catch(err => done(err));
	});

	it('should use promises to deliver data /w options', done => {
		const processRequestSpy = sinon.stub(AuthClient, '_processRequest', (getNewToken, options, callback) => {
			callback(null, {});
		});

		sinon.stub(AuthClient, 'isExpired').returns(true);

		AuthClient.getAccessToken({ force: true })
			.then(data => {
				assert(!!data);
				assert.equal(processRequestSpy.calledWith(true, {}), true);
				done();
			})
			.catch(err => done(err));
	});

	it('should use promises to deliver error', done => {
		sinon.stub(AuthClient, 'isExpired').returns(true);
		sinon.stub(AuthClient, '_processRequest', (getNewToken, options, callback) => {
			callback({}, null);
		});

		AuthClient.getAccessToken()
			.then(data => done(data))
			.catch(err => {
				assert.equal(!!err, true);
				done();
			});
	});

	it('should throw error if trying to use callbacks and promise at same time', () => {
		let threw = false;

		try {
			AuthClient.getAccessToken(() => {}).then(() => {});
		} catch (err) {
			threw = !!err;
		}
		assert(threw);
	});
});
