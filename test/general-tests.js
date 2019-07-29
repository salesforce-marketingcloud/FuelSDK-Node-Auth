/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

const assert = require('assert');
const FuelAuth = require('../lib/fuel-auth');

describe('General Tests', () => {
	it('should be a constructor', () => {
		assert.equal(typeof FuelAuth, 'function');
	});

	it('clientSecret not needed for OAuth2 public app', () => {	
		var options = {
			clientId:'client_id',
			authUrl:'test',
			authOptions:{
				authVersion: 2,
				applicationType: 'public',
				redirectURI: 'test',
				authorizationCode: 'test'
			}
		};
		assert.doesNotThrow(() => new FuelAuth(options), "clientId or clientSecret is missing or invalid");
	});


	it('AuthorizationCode mandatory for public app', () => {	
		var options = {
			clientId:'client_id',
			clientSecret:'client_secret',
			authUrl:'test',
			authOptions:{
				authVersion: 2,
				applicationType: 'public',
				redirectURI: 'test'
			}
		};
		assert.throws(() => new FuelAuth(options), "RedirectURI and Authorization Code are required for Public App OAuth2 Authentication");
	});

	it('RedirectURI mandatory for public app', () => {
		var options = {
			clientId:'client_id',
			clientSecret:'client_secret',
			authUrl:'test',
			authOptions:{
				authVersion: 2,
				applicationType: 'public',
				authorizationCode: 'test'
			}
		};
		assert.throws(() => new FuelAuth(options), "RedirectURI and Authorization Code are required for Public App OAuth2 Authentication");
	});

	it('AuthorizationCode mandatory for web app', () => {
		var options = {
			clientId:'client_id',
			clientSecret:'client_secret',
			authUrl:'test',
			authOptions:{
				authVersion: 2,
				applicationType: 'web',
				redirectURI: 'test'
			}
		};
		assert.throws(() => new FuelAuth(options), "RedirectURI and Authorization Code are required for Web App OAuth2 Authentication");
	});

	it('RedirectURI mandatory for web app', () => {
		var options = {
			clientId:'client_id',
			clientSecret:'client_secret',
			authUrl:'test',
			authOptions:{
				authVersion: 2,
				applicationType: 'web',
				authorizationCode: 'test'
			}
		};
		assert.throws(() => new FuelAuth(options), "RedirectURI and Authorization Code are required for Web App OAuth2 Authentication");
	});

	it('should require clientId and clientSecret', () => {
		let AuthClient;

		// testing with nothing passed into constructor
		try {
			AuthClient = new FuelAuth();
			assert.fail("Should Throw Exception with Error Message options are required. see readme.");
		} catch (err) {
			assert.equal(err.message, 'options are required. see readme.');
		}

		// testing with clientId passed into constructor
		try {
			AuthClient = new FuelAuth({ clientId: 'test' });
			assert.fail("Should Throw Exception with Error Message clientId or clientSecret is missing or invalid");
		} catch (err) {
			assert.equal(err.message, 'clientId or clientSecret is missing or invalid');
		}

		// testing with clientSecret passed into constructor
		try {
			AuthClient = new FuelAuth({ clientSecret: 'test' });
			assert.fail("Should Throw Exception with Error Message clientId or clientSecret is missing or invalid");
		} catch (err) {
			assert.equal(err.message, 'clientId or clientSecret is missing or invalid');
		}

		// testing with clientId and clientSecret passed as objects into constructor
		try {
			AuthClient = new FuelAuth({
				clientId: { test: 'test' },
				clientSecret: { test: 'test' }
			});
		} catch (err) {
			assert.equal(err.message, 'clientId or clientSecret must be strings');
		}

		AuthClient = new FuelAuth({
			clientId: 'test',
			clientSecret: 'test'
		});

		assert.equal(typeof AuthClient, 'object');
	});

	it('should have getAccessToken on prototype', () => {
		assert.equal(typeof FuelAuth.prototype.getAccessToken, 'function');
	});

	it('should have isExpired on prototype', () => {
		assert.equal(typeof FuelAuth.prototype.isExpired, 'function');
	});

	it('should have invalidateToken on prototype', () => {
		assert.equal(typeof FuelAuth.prototype.invalidateToken, 'function');
	});
});
