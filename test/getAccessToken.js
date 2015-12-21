/*
 * Copyright (c) 2015, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

'use strict';

var assert   = require('assert');
var FuelAuth = require('../lib/fuel-auth');
var sinon    = require('sinon');

describe('getAccessToken', function() {
	var AuthClient;
	var sampleCb;

	beforeEach(function() {
		AuthClient = new FuelAuth({
			clientId: 'test'
			, clientSecret: 'test'
			, authUrl: 'http://127.0.0.1:3000/v1/requestToken'
		});

		sampleCb = function() { return true; };
	});

	it('should throw error if callback provided is not a function', function() {
		var didThrow = false;
		var error;

		try {
			AuthClient.getAccessToken({}, 'test');
		} catch(err) {
			didThrow = true;
			error    = err.message;
		}

		assert.equal(didThrow, true);
		assert.equal(error, 'argument callback must be a function');
	});

	it('should call _processRequest with provided callback and options', function() {
		var options           = { test: true };
		var processRequestSpy = sinon.spy(AuthClient, '_processRequest');
		var expiredSpy        = sinon.stub(AuthClient, 'isExpired').returns(true);

		AuthClient.getAccessToken(options, sampleCb);
		assert.equal(processRequestSpy.calledWith(true, options, sampleCb), true);
		assert.equal(expiredSpy.calledOnce, true);
	});

	it('should call _processRequest when only callback is provided', function() {
		var expiredSpy        = sinon.stub(AuthClient, 'isExpired').returns(true);
		var processRequestSpy = sinon.spy(AuthClient, '_processRequest');

		AuthClient.getAccessToken(sampleCb);
		assert.equal(processRequestSpy.calledWith(true, {}, sampleCb), true);
		assert.equal(expiredSpy.calledOnce, true);
	});

	it('should not force new request if not expired and no option', function() {
		var processRequestSpy = sinon.spy(AuthClient, '_processRequest');

		sinon.stub(AuthClient, 'isExpired').returns(false);

		AuthClient.getAccessToken(sampleCb);
		assert.equal(processRequestSpy.calledWith(false, {}, sampleCb), true);
	});

	it('should use force option', function() {
		var processRequestSpy = sinon.spy(AuthClient, '_processRequest');

		sinon.stub(AuthClient, 'isExpired').returns(false);

		AuthClient.getAccessToken({ force: true }, sampleCb);
		assert.equal(processRequestSpy.calledWith(true, {}, sampleCb), true);
	});

	it('should use promises to deliver data', function(done) {
		sinon.stub(AuthClient, 'isExpired').returns(true);
		sinon.stub(AuthClient, '_processRequest', function(getNewToken, options, callback) {
			callback(null, {});
		});

		AuthClient
			.getAccessToken()
			.then(function(data) {
				assert.equal(!!data, true);
				done();
			})
			.catch(function(err) {
				done(err);
			});
	});

	it('should use promises to deliver data /w options', function(done) {
		var processRequestSpy = sinon.stub(AuthClient, '_processRequest', function(getNewToken, options, callback) {
			callback(null, {});
		});

		sinon.stub(AuthClient, 'isExpired').returns(true);

		AuthClient
			.getAccessToken({ force: true })
			.then(function(data) {
				assert(!!data);
				assert.equal(processRequestSpy.calledWith(true, {}), true);
				done();
			})
			.catch(function(err) {
				done(err);
			});
	});

	it('should use promises to deliver error', function(done) {
			sinon.stub(AuthClient, 'isExpired').returns(true);
			sinon.stub(AuthClient, '_processRequest', function(getNewToken, options, callback) {
				callback({}, null);
			});

			AuthClient
				.getAccessToken()
				.then(function(data) {
					done(data);
				})
				.catch(function(err) {
					assert.equal(!!err, true);
					done();
				});
	});


	it('should throw error if trying to use callbacks and promise at same time', function() {
		var threw = false;

		try {
			AuthClient.getAccessToken(function() {}).then(function() {});
		} catch(err) {
			threw = !!err;
		}
		assert(threw);
	});
});
