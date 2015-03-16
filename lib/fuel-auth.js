/**
 * Copyright (c) 2014​, salesforce.com, inc.
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

var _           = require( 'lodash' );
var PromisePoly = require( 'promise' );
var request     = require( 'request' );
var version     = require( '../package.json').version;

function FuelAuth ( options ) {
	'use strict';

	//make sure clientId and clientSecret are available and not empty
	if( Boolean( options ) ) {
		if( !options.clientId || !options.clientSecret ) {
			throw new Error( 'clientId or clientSecret is missing or invalid' );
		}

		if( !_.isString( options.clientId ) || !_.isString( options.clientSecret ) ) {
			throw new Error( 'clientId or clientSecret must be strings' );
		}
	} else {
		throw new Error( 'options are required. see readme.' );
	}

	// set required values
	this.accessToken  = options.accessToken;
	this.authUrl      = options.authUrl || 'https://auth.exacttargetapis.com/v1/requestToken';
	this.clientId     = options.clientId;
	this.clientSecret = options.clientSecret;
	this.expiration   = null;
	this.Promiser     = (typeof Promise === 'undefined') ? PromisePoly : Promise;
	this.refreshToken = options.refreshToken;
	this.scope        = options.scope;
	this.version      = version;
}

FuelAuth.prototype.getAccessToken = function( options, callback ) {
	'use strict';

	var getNewToken;
	var requestOptions = {};

	if( _.isFunction( options ) ) {
		callback = options;
	} else if( _.isPlainObject( options ) ) {
		requestOptions = options;
	}

	getNewToken = this.isExpired() || (requestOptions.force || false);

	delete requestOptions.force;

	if(!callback) {
		return new this.Promiser(function(resolve, reject) {
			this._processRequest(getNewToken, requestOptions, null, { resolve: resolve, reject: reject });
		}.bind(this));
	}

	// well we have a callback it looks like
	this._processRequest(getNewToken, requestOptions, callback, null);
};

FuelAuth.prototype.isExpired = function() {
	'use strict';
	var expired = false;

	// if current atomic time is equal or after exp, or we don't have a token, return true
	if( ( this.expiration && this.expiration <= process.hrtime()[0] ) || !this.accessToken ) {
		expired = true;
	}

	return expired;
};

FuelAuth.prototype._deliver = function(data, err, cb, promise) {
	'use strict';
	if(cb) {
		if(err) {
			cb(data, null);
		} else {
			cb(null, data);
		}
	} else if(promise) {
		promise(data);
	} else {
		throw new Error('You are using this wrong');
	}
};

FuelAuth.prototype._processRequest = function(getNewToken, options, callback, promiseObj) {
	'use strict';
	var data;

	if(getNewToken) {
		this._requestToken(options)
			.then(function(body) {
				this._deliver(body, false, callback, promiseObj && promiseObj.resolve);
			}.bind(this))
			.catch(function(err) {
				this._deliver(err, true, callback, promiseObj && promiseObj.reject);
			}.bind(this));
	} else {
		data = {
			accessToken: this.accessToken
			, expiresIn: this.expiration - process.hrtime()[0]
		};

		this._deliver(data, false, callback, promiseObj && promiseObj.resolve);
	}
};

FuelAuth.prototype._requestToken = function( requestOptions ) {
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

	_.merge( options, requestOptions ); // deepMerge options received from getAccessToken if they're there

	if( this.refreshToken ) {
		// adding refresh token to json if it's there
		options.json.refreshToken = this.refreshToken;
	} else if ( this.scope ) {
		// adding scope to json if it's there
		// it's not valid to use both scope and a refresh token
		options.json.scope = this.scope;
	}

	return new this.Promiser(function(resolve, reject) {

		request( options, function ( err, res, body ) {
			if( err ) {
				reject(err);
				return;
			}

			// setting variables on object created to be used later
			if( body && body.refreshToken ) {
				this.refreshToken = body.refreshToken;
			}

			this.accessToken = body.accessToken || null;
			this.expiration  = ( body.expiresIn ) ? process.hrtime()[0] + body.expiresIn : null;

			resolve(body);

		}.bind( self ) ); // binding function to FuelAuthClient so we can have a good context inside callback
	});
};

// exporting module
module.exports = FuelAuth;
