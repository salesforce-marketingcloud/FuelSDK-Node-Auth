var version = require( '../package.json').version;
var request = require('request');
var _       = require( 'lodash' );

function FuelAuth( options ) {
	'use strict';
	var defaults;

	if( !( this instanceof FuelAuth ) ) {
		return new FuelAuth( options );
	}

	defaults = {
		'clientId' : null,
		'clientSecret' : null,
		'authUrl' : 'https://auth.exacttargetapis.com/v1/requestToken',
		'refreshToken' : '',
		'accessToken' : '',
		'expiration' : ''
	};

	options = _.merge( {}, defaults, options );

	//make sure clientId and clientSecret are available and not empty
	if( !options.clientId || !options.clientSecret ) {
		throw new Error( 'clientId or clientSecret is missing or invalid' );
	}

	//set required
	this.clientId     = options.clientId;
	this.clientSecret = options.clientSecret;
	this.authUrl      = options.authUrl;

	if( options.expiration ) {
		this.expiration = options.expiration;
	}

	if( options.refreshToken ) {
		this.refreshToken = options.refreshToken;
	}

	if( options.accessToken ) {
		this.refreshToken = process.hrtime()[0] + options.accessToken;
	}
}

FuelAuth.prototype.getAccessToken = function getAccessToken( callback ) {
	'use strict';
	var self = this;

	//set auth options for request
	var options = {
		url: this.authUrl,
		method: 'POST',
		json: {
			clientId: this.clientId,
			clientSecret: this.clientSecret
		}
	};

	if( this.refreshToken ) {
		options.json.refreshToken = this.refreshToken;
	}

	request( options, function ( err, res, body ) {
		if( err ) {
			callback( err );
			return;
		}

		if( body && body.refreshToken ) {
			self.refreshToken = body.refreshToken;
		}

		self.accessToken = body.accessToken;
		self.expiration  = process.hrtime()[0] + body.expiresIn;

		callback( err, res, body );
	});
};

FuelAuth.prototype._checkExpired = function() {
	'use strict';
	//if current atomic time is equal or after exp, get new token
	if( this.expiration && process.hrtime()[0] >= this.expiration ) {
		return true;
	} else {
		return false;
	}
};

FuelAuth.version = version;
module.exports   = FuelAuth;
