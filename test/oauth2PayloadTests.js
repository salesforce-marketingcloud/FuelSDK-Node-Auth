/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';
const assert = require('assert');
const FuelAuth = require('../lib/fuel-auth');

describe('Oauth2 Payload Tests', () => {
	it('auth payload should have public app attributes', () => {

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
     
        var client = new FuelAuth(options);
        var payload = client.createPayloadForOauth2();

        assert.equal(payload.client_id, options.clientId);
        assert.equal(payload.redirect_uri, options.authOptions.redirectURI);
        assert.equal(payload.code, options.authOptions.authorizationCode);
        assert.equal(payload.grant_type, 'authorization_code');
    });

    it('auth payload should have web app attributes', () => {

        var options = {
            clientId:'client_id',
            clientSecret: 'client_secret',
			authUrl:'test',
			authOptions:{
				authVersion: 2,
				applicationType: 'web',
				redirectURI: 'test',
				authorizationCode: 'test'
			}
        };
     
        var client = new FuelAuth(options);
        var payload = client.createPayloadForOauth2();

        assert.equal(payload.client_id, options.clientId);
        assert.equal(payload.client_secret, options.clientSecret);
        assert.equal(payload.redirect_uri, options.authOptions.redirectURI);
        assert.equal(payload.code, options.authOptions.authorizationCode);
        assert.equal(payload.grant_type, 'authorization_code');
    });

    it('auth payload should have server app attributes', () => {

        var options = {
            clientId:'client_id',
            clientSecret: 'client_secret',
			authUrl:'test',
			authOptions:{
				authVersion: 2
			}
        };
     
        var client = new FuelAuth(options);
        var payload = client.createPayloadForOauth2();

        assert.equal(payload.client_id, options.clientId);
        assert.equal(payload.client_secret, options.clientSecret);
        assert.equal(payload.grant_type, 'client_credentials');
    });

    it('auth payload should have refresh token attributes', () => {

        var options = {
            clientId:'client_id',
            clientSecret: 'client_secret',
			authUrl:'test',
			authOptions:{
				authVersion: 2
			}
        };
     
        var client = new FuelAuth(options);
        client.refreshToken = "test";

        var payload = client.createPayloadForOauth2();

        assert.equal(payload.client_id, options.clientId);
        assert.equal(payload.client_secret, options.clientSecret);
        assert.equal(payload.refresh_token, client.refreshToken);
        assert.equal(payload.grant_type, 'refresh_token');
    });
    
});