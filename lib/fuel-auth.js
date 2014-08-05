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

var version = require( '../package.json').version;
var request = require( 'request' );
var _       = require( 'lodash' );

function FuelAuth ( options ) {
	'use strict';

	// returning instance if there already is one
	if( !( this instanceof FuelAuth ) ) {
		return new FuelAuth( options );
	}

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
	this.clientId     = options.clientId;
	this.clientSecret = options.clientSecret;
	this.authUrl      = options.authUrl || 'https://auth.exacttargetapis.com/v1/requestToken';
	this.refreshToken = options.refreshToken;
	this.accessToken  = options.accessToken;
	this.expiration   = null;
	this.version      = version;
}

FuelAuth.prototype.getAccessToken = function( options, callback ) {
	'use strict';

	var force;
	var requestOptions = {};

	if( _.isFunction( options ) ) {
		callback = options;
	} else if( _.isPlainObject( options ) ) {
		requestOptions = options;
	}

	// need a callback
	if( !callback ) {
		return new Error( 'need to provide a callback' );
	}

	force = requestOptions.force || false;

	delete requestOptions.force;

	if( this.isExpired() || Boolean( force ) ) {

		// token is expired, let's get a new one
		this._requestToken( requestOptions, callback );

	} else {

		// token is not expired, let's return the current one
		callback( null, { accessToken: this.accessToken, expiresIn: this.expiration - process.hrtime()[0] } );

	}
};

FuelAuth.prototype.isExpired = function() {
	'use strict';

	// if current atomic time is equal or after exp, or we don't have a token, return true
	if( ( this.expiration && this.expiration <= process.hrtime()[0] ) || !this.accessToken ) {
		return true;
	} else {
		return false;
	}
};

FuelAuth.prototype._requestToken = function( requestOptions, callback ) {
	'use strict';

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

	// adding refresh token to json if it's there
	if( this.refreshToken ) {
		options.json.refreshToken = this.refreshToken;
	}

	// sending request to API
	request( options, function ( err, res, body ) {
		// emitting request error if there is one
		if( err ) {
			callback( err, null );
			return;
		}

		// setting variables on object created to be used later
		if( body && body.refreshToken ) {
			this.refreshToken = body.refreshToken;
		}

		this.accessToken = body.accessToken || null;
		this.expiration  = ( body.expiresIn ) ? process.hrtime()[0] + body.expiresIn : null;

		// delivering token for others to use
		callback( null, body );

	}.bind( this ) ); // binding function to FuelAuthClient so we can have a good context inside callback
};

// exporting module
module.exports = FuelAuth;
