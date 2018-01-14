/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

var assert   = require('assert');
var FuelAuth = require('../lib/fuel-auth');

describe('isExpired', function () {
	var AuthClient;

	beforeEach(function() {
		AuthClient = new FuelAuth({
			clientId: 'test'
			, clientSecret: 'test'
		});
	});

	it('should return true when there is no expiration set and no accessToken (expired)', function() {
		assert(AuthClient.isExpired());
	});

	it('should return true when expiration > process.hrtime()[0] and no accessToken (expired)', function() {
		AuthClient.expiration = 111111111111;
		assert(AuthClient.isExpired());
	});

	it('should return false when expiration > process.hrtime()[0] and there is an accessToken (not expired)', function() {
		AuthClient.accessToken = '<accessToken>';
		AuthClient.expiration  = 111111111111;
		assert(!AuthClient.isExpired());
	});
});
