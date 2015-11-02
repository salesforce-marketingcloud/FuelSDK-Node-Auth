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

var merge   = require('lodash.merge');
var Promise = (typeof Promise === 'undefined') ? require('bluebird') : Promise;
var request = require('request');
var version = require('../package.json').version;

function FuelAuth(options) {
	'use strict';

	if(options) {
		if(!options.clientId || !options.clientSecret) {
			throw new Error('clientId or clientSecret is missing or invalid');
		}

		if((typeof options.clientId !== 'string') || (typeof options.clientSecret !== 'string')) {
			throw new Error('clientId or clientSecret must be strings');
		}
	} else {
		throw new Error('options are required. see readme.');
	}

	// set required values
	this.accessToken  = options.accessToken;
	this.authUrl      = options.authUrl || 'https://auth.exacttargetapis.com/v1/requestToken';
	this.clientId     = options.clientId;
	this.clientSecret = options.clientSecret;
	this.expiration   = null;
	this.refreshToken = options.refreshToken;
	this.scope        = options.scope;
	this.version      = version;
}

FuelAuth.prototype.getAccessToken = function(options, callback) {
	'use strict';

	var done = callback;
	var getNewToken;

	options = options || {};

	if(typeof options === 'function') {
		done    = options;
		options = {};
	}

	if(done !== undefined && typeof done !== 'function') {
		throw new TypeError('argument callback must be a function');
	}

	getNewToken = this.isExpired() || Boolean(options.force);

	delete options.force;

	if(done) {
		return this._processRequest(getNewToken, options, done);
	}

	return new Promise(function(resolve, reject) {
		this._processRequest(getNewToken, options, function(err, data) {
			if(err) {
				return reject(err);
			}
			resolve(data);
		});
	}.bind(this));
};

FuelAuth.prototype.isExpired = function() {
	'use strict';
	var expired = false;

	// if current atomic time is equal or after exp, or we don't have a token, return true
	if((this.expiration && this.expiration <= process.hrtime()[0]) || !this.accessToken) {
		expired = true;
	}

	return expired;
};

FuelAuth.prototype._processRequest = function(getNewToken, options, callback) {
	'use strict';
	var data;

	if(getNewToken) {
		this._requestToken(options)
			.then(function(body) {
				callback(null, body);
			})
			.catch(function(err) {
				callback(err, null);
			});
	} else {
		data = {
			accessToken: this.accessToken
			, expiresIn: this.expiration - process.hrtime()[0]
		};

		callback(null, data);
	}
};

FuelAuth.prototype._requestToken = function(requestOptions) {
	'use strict';

	var self = this;

	// set auth options for request
	var options = {
		url: this.authUrl,
		method: 'POST',
		json: {
			clientId: this.clientId,
			clientSecret: this.clientSecret
		}
	};

	merge(options, requestOptions);

	if(this.refreshToken) {
		// adding refresh token to json if it's there
		options.json.refreshToken = this.refreshToken;
	} else if (this.scope) {
		// adding scope to json if it's there
		// it's not valid to use both scope and a refresh token
		options.json.scope = this.scope;
	}

	return new Promise(function(resolve, reject) {
		request(options, function (err, res, body) {
			if(err) {
				return reject(err);
			}

			// setting variables on object created to be used later
			if(body && body.refreshToken) {
				this.refreshToken = body.refreshToken;
			}

			this.accessToken = body.accessToken || null;
			this.expiration  = (body.expiresIn) ? process.hrtime()[0] + body.expiresIn : null;

			resolve(body);

		}.bind(self));
	});
};

module.exports = FuelAuth;
