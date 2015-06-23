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
