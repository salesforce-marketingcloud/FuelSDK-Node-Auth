/*
 * Copyright (c) 2016, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

'use strict';

var assert   = require('assert');
var FuelAuth = require('../lib/fuel-auth');
var Promise  = (typeof Promise === 'undefined') ? require('bluebird') : Promise;
var sinon    = require('sinon');

var AuthClient;
var sampleData;
var sampleOptions;

beforeEach(function() {
	sampleData    = { data: true };
	sampleOptions = { options: true };

	AuthClient = new FuelAuth({
		clientId: 'test'
		, clientSecret: 'test'
		, authUrl: 'http://127.0.0.1:3000/v1/requestToken'
	});
});

describe('_processRequest', function() {
	it('should get a new token', function(done) {
		var getNewToken = true;
		var requestSpy  = sinon.stub(AuthClient, '_requestToken', function() {
			return new Promise(function(resolve) {
				resolve(sampleData);
			});
		});

		AuthClient._processRequest(getNewToken, sampleOptions, function(err, data) {
			assert.strictEqual(requestSpy.calledOnce, true, '_requestToken should only be called once');
			assert.strictEqual(requestSpy.calledWith(sampleOptions), true, '_requestToken should be passed options');
			assert.strictEqual(err, null);
			assert.deepEqual(data, sampleData);
			done();
		});
	});

	it('should handle error when trying to get new token', function(done) {
		var getNewToken = true;
		var requestSpy  = sinon.stub(AuthClient, '_requestToken', function() {
			return new Promise(function(resolve, reject) {
				reject(sampleData);
			});
		});

		AuthClient._processRequest(getNewToken, sampleOptions, function(err, data) {
			assert.strictEqual(requestSpy.calledOnce, true, '_requestToken should only be called once');
			assert.strictEqual(requestSpy.calledWith(sampleOptions), true, '_requestToken should be passed options');
			assert.strictEqual(data, null, 'data should be null');
			assert.deepEqual(err, sampleData, 'err received should deep equal error data');
			done();
		});
	});

	it('should return cached data', function(done) {
		var getNewToken = false;
		var requestSpy  = sinon.stub(AuthClient, '_requestToken');

		AuthClient.accessToken = '<accessToken>';
		AuthClient.expiration  = 0;

		AuthClient._processRequest(getNewToken, null, function(err, data) {
			assert.equal(requestSpy.called, false, '_requestToken should not have been called');
			assert.strictEqual(err, null, 'error should be null if we have cached data');
			assert.equal(data.accessToken, AuthClient.accessToken, 'should return cached token');
			assert.equal(data.expiresIn < 0, true, 'expires should be less than 0 in this case');
			done();
		});
	});
});
