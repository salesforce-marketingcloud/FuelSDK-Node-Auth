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
