var version      = require( '../package.json').version;
var request      = require( 'request' );
var _            = require( 'lodash' );
var EventEmitter = require( 'events' ).EventEmitter;
var util         = require( 'util' );

function FuelNodeAuth ( options ) {
	'use strict';

	// setting up variables
	var defaults;

	// returning instance if there already is one
	if( !( this instanceof FuelNodeAuth ) ) {
		return new FuelNodeAuth( options );
	}

	// setting up EventEmitter
	EventEmitter.call( this );

	// adding version to object
	this.version = version;

	// setting up defaults
	defaults = {
		'clientId' : null,
		'clientSecret' : null,
		'authUrl' : 'https://auth.exacttargetapis.com/v1/requestToken',
		'refreshToken' : '',
		'accessToken' : '',
		'expiration' : ''
	};

	// combining defaults and options
	options = _.merge( {}, defaults, options );

	//make sure clientId and clientSecret are available and not empty
	if( !options.clientId || !options.clientSecret ) {
		throw new Error( 'clientId or clientSecret is missing or invalid' );
	}

	// set required values
	this.clientId     = options.clientId;
	this.clientSecret = options.clientSecret;
	this.authUrl      = options.authUrl;

	// add extra options if they were passed in
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

// adding inheriting properties from EventEmitter
util.inherits( FuelNodeAuth, EventEmitter );

FuelNodeAuth.prototype.getAccessToken = function( callback, context ) {
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

	// adding refresh token to json if it's there
	if( this.refreshToken ) {
		options.json.refreshToken = this.refreshToken;
	}

	// sending request to API
	request( options, function ( err, res, body ) {
		// emitting error if there is one
		if( err ) {
			self._deliverResponse( 'error', err, callback, context );
			return;
		}

		// setting variables on object created to be used later
		if( body && body.refreshToken ) {
			self.refreshToken = body.refreshToken;
		}

		self.accessToken = body.accessToken;
		self.expiration  = process.hrtime()[0] + body.expiresIn;

		// emitting token for others to use
		self._deliverResponse( 'success', body.accessToken, callback, context );
	});
};

FuelNodeAuth.prototype.checkExpired = function() {
	'use strict';

	//if current atomic time is equal or after exp, get new token
	if( this.expiration && process.hrtime()[0] >= this.expiration ) {
		return true;
	} else {
		return false;
	}
};

FuelNodeAuth.prototype._deliverResponse = function( type, data, callback, context ) {
	'use strict';

	// if it's a callback, lets use that
	if( _.isFunction( callback ) ) {
		context = context || this;

		if( type === 'error' ) {
			callback.call( context, data, null );
		} else if( type === 'success' ) {
			callback.call( context, null, data );
		}
		return;
	}

	this.emit( 'token:' + type, data );
};

// exporting module
module.exports = FuelNodeAuth;
