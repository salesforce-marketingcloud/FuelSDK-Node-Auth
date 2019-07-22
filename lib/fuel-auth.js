/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */
'use strict';

const request = require('request');
const merge = require('lodash.merge');
const version = require('../package.json').version;

module.exports = class FuelAuth {
	constructor(options) {	
		var isOauth2Flow = options && options.authOptions ? options.authOptions.authVersion === 2 : false;
		if (options) {
			if (!options.clientId) {
				throw new Error('clientId or clientSecret is missing or invalid');
			}
			if (typeof options.clientId !== 'string') {
				throw new Error('clientId or clientSecret must be strings');
			}
			if(isOauth2Flow) {
				if(options.authOptions.applicationType !== 'public'){
					if (!options.clientSecret) {
						throw new Error('clientId or clientSecret is missing or invalid');
					}
					if (typeof options.clientSecret !== 'string') {
						throw new Error('clientId or clientSecret must be strings');
					}
				}
				if (!options.authUrl) {
					throw new Error('Auth URL is mandatory for OAuth2 Authentication');
				}
				if(options.authOptions.applicationType === 'public' || options.authOptions.applicationType === 'web'){
					if(!options.authOptions.redirectURI || !options.authOptions.authorizationCode){
						throw new Error('RedirectURI and Authorization Code are required for Public/Web App OAuth2 Authentication');
					}
				}
			} else {
				if (!options.clientSecret) {
					throw new Error('clientId or clientSecret is missing or invalid');
				}
				if (typeof options.clientSecret !== 'string') {
					throw new Error('clientId or clientSecret must be strings');
				}
			}
		} else {
			throw new Error('options are required. see readme.');
		}

		// set required values
		this.accessToken = options.accessToken;
		this.authUrl = options.authUrl || 'https://auth.exacttargetapis.com/v1/requestToken';
		this.clientId = options.clientId;
		this.clientSecret = options.clientSecret;
		this.expiration = null;
		this.refreshToken = options.refreshToken;
		this.version = version;
		this.globalReqOptions = options.globalReqOptions || {};

		if(options.authOptions){
			this.accountId = options.authOptions.accountId;
			this.authVersion = options.authOptions.authVersion;
			this.scope = options.authOptions.scope;
			this.applicationType = options.authOptions.applicationType;
			this.redirectURI = options.authOptions.redirectURI;
			this.authorizationCode = options.authOptions.authorizationCode;
			this.soapUrl = null;
			this.restUrl = null;
		}
	}
	getAccessToken(options, callback) {
		let done = callback;

		options = options || {};

		if (typeof options === 'function') {
			done = options;
			options = {};
		}

		if (done !== undefined && typeof done !== 'function') {
			throw new TypeError('argument callback must be a function');
		}

		const getNewToken = this.isExpired() || Boolean(options.force);

		delete options.force;

		if (done) {
			return this._processRequest(getNewToken, options, done);
		}

		return new Promise((resolve, reject) => {
			this._processRequest(getNewToken, options, function(err, data) {
				if (err) {
					return reject(err);
				}
				resolve(data);
			});
		});
	}
	isExpired() {
		let expired = false;

		// if current atomic time is equal or after exp, or we don't have a token, return true
		if ((this.expiration && this.expiration <= process.hrtime()[0]) || !this.accessToken) {
			expired = true;
		}

		return expired;
	}
	invalidateToken(accessToken) {
		if (accessToken === undefined) {
			this.accessToken = undefined;
		} else if (typeof accessToken !== 'string') {
			throw new TypeError('accessToken must be string type');
		} else if (this.accessToken === accessToken) {
			this.accessToken = undefined;
		}
	}
	_processRequest(getNewToken, options, callback) {
		if (getNewToken) {
			this._requestToken(options)
				.then(body => callback(null, body))
				.catch(err => callback(err, null));
		} else {
			let response = {
				accessToken: this.accessToken,
				expiresIn: this.expiration - process.hrtime()[0]
			};
			if(this.authVersion === 2) {
				response.rest_instance_url = this.restUrl;
				response.soap_instance_url = this.soapUrl;
			}
			callback(null, response);
		}
	}
	createPayloadForOauth2(){
		const payload = {};
		payload.client_id = this.clientId;
		if(this.applicationType !== 'public'){
			payload.client_secret = this.clientSecret;
		}
		
		if(this.refreshToken){
			payload.grant_type = 'refresh_token';
			payload.refresh_token = this.refreshToken;
		}
		else if(this.applicationType === 'public' || this.applicationType === 'web'){
			payload.grant_type = 'authorization_code';
			payload.code = this.authorizationCode;
			payload.redirect_uri = this.redirectURI;
		}
		else{
			payload.grant_type = 'client_credentials';
		}
			
		if(this.accountId){
			payload.account_id = this.accountId;
		}
		if(this.scope){
			payload.scope = this.scope;
		}
		return payload;	
	}
	_requestToken(requestOptions) {
		var payload = {};
		if(this.authVersion === 2){
			payload = this.createPayloadForOauth2();
		} else {
			payload.clientId = this.clientId;
			payload.clientSecret = this.clientSecret;
		}
		// set auth options for request
		const baseOptions = {
			url: this.authUrl,
			method: 'POST',
			json: payload
		};

		const options = merge({}, this.globalReqOptions, baseOptions, requestOptions);
		
		if(this.authVersion === undefined || this.authVersion !== 2){
			if (this.refreshToken) {
				// adding refresh token to json if it's there
				options.json.refreshToken = this.refreshToken;
			} else if (this.scope) {
				// adding scope to json if it's there
				// it's not valid to use both scope and a refresh token
				options.json.scope = this.scope;
			}
		}

		return new Promise((resolve, reject) => {
			request(options, (err, res, body) => {
				if (err) {
					return reject(err);
				}

				if (!body) {
					let localError = new Error('No response body');
					localError.res = res;
					reject(localError);
					return;
				}

				// setting variables on object created to be used later
				if (body.refreshToken) {
					this.refreshToken = body.refreshToken;
				}

				if(this.authVersion === 2){
					this.accessToken = body.access_token || null;
					body.accessToken = this.accessToken;
					this.soapUrl = body.soap_instance_url;
					this.restUrl = body.rest_instance_url;
					this.expiration = body.expires_in ? process.hrtime()[0] + body.expires_in : null;
					if (body.refresh_token) {
						this.refreshToken = body.refresh_token;
					}
				} else {
					this.accessToken = body.accessToken || null;
					this.expiration = body.expiresIn ? process.hrtime()[0] + body.expiresIn : null;	
				}
				resolve(body);
			});
		});
	}
};
