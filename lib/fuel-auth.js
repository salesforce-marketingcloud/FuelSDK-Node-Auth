/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */
'use strict';

const request = require('request');
const version = require('../package.json').version;

module.exports = class FuelAuth {
	constructor(options) {
		if (options) {
			if (!options.clientId || !options.clientSecret) {
				throw new Error('clientId or clientSecret is missing or invalid');
			}

			if (typeof options.clientId !== 'string' || typeof options.clientSecret !== 'string') {
				throw new Error('clientId or clientSecret must be strings');
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
		this.scope = options.scope;
		this.version = version;
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
			callback(null, {
				accessToken: this.accessToken,
				expiresIn: this.expiration - process.hrtime()[0]
			});
		}
	}
	_requestToken(requestOptions) {
		// set auth options for request
		const options = {
			url: this.authUrl,
			method: 'POST',
			json: {
				clientId: this.clientId,
				clientSecret: this.clientSecret
			}
		};

		Object.assign(options, requestOptions);

		if (this.refreshToken) {
			// adding refresh token to json if it's there
			options.json.refreshToken = this.refreshToken;
		} else if (this.scope) {
			// adding scope to json if it's there
			// it's not valid to use both scope and a refresh token
			options.json.scope = this.scope;
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

				this.accessToken = body.accessToken || null;
				this.expiration = body.expiresIn ? process.hrtime()[0] + body.expiresIn : null;

				resolve(body);
			});
		});
	}
};
