var version = require( '../package.json').version;
var request = require('request');
var _       = require( 'lodash' );

var fuelAuth = function( options ) {
	var defaults;

	if( !( this instanceof fuelAuth ) ) {
		return new fuelAuth( options );
	}

	defaults = {
		'clientId' : null,
		'clientSecret' : null,
		'authUrl' : 'https://auth.exacttargetapis.com/v1/requestToken',
		'soapEndpoint': 'https://webservice.exacttarget.com/Service.asmx',
		'restEndpoint' : 'https://www.exacttargetapis.com/',
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
	this.soapEndpoint = options.soapEndpoint;
	this.restEndpoint = options.restEndpoint;

	//set optionals
	//if (options.customHeaders === {}) this.customHeaders = options.customHeaders;
	if( options.expiration ) {
		this.expiration = options.expiration;
	}

	if( options.refreshToken ) {
		this.refreshToken = options.refreshToken;
	}

	if( options.accessToken ) {
		this.refreshToken = process.hrtime()[0] + options.accessToken;
	}
};

fuelAuth.prototype.getAccessToken = function(callback) {
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

fuelAuth.prototype.soapRequest = function( options, callback ) {
	var self     = this;
	var defaults = {
		headers: {
			'User-Agent' : 'node-fuel/' + fuelAuth.version
		}
	};

	options = _.merge( {}, defaults, options );

	options.url                     = self.soapEndpoint;
	options.method                  = 'POST';
	options.headers.SOAPAction      = options.headers.SOAPAction;
	options.headers['Content-Type'] = 'text/xml';

	if( !self.accessToken || !this._checkExpired() ) {
		// make the request after getting new token
		self.getAccessToken( function( err, res, body ) {
			if( err ) {
				callback( err );
				return;
			}


			options.body = self._createEnvelope( options.body ); // is that what you meant (options.body instead of body)? if so you're never using anything from this request except to behind the scenes refresh

			self._makeRequest( options, callback );
		});
	} else {
		options.body = self._createEnvelope( options.body );

		self._makeRequest( options, callback );
	}
};

fuelAuth.prototype.restRequest = function(options, callback) {
	var self     = this;
	var defaults = {
		method: 'GET',
		headers: {
			'User-Agent' : 'node-fuel/' + fuelAuth.version
		},
		json : true
	};

	options = _.merge( {}, defaults, options );

	options.url    = self.restEndpoint + options.url;
	options.method = options.method;
	options.json   = options.json;

	if( options.body ) {
		// why does this need to be here? if there's an option.body it should not need to be reassigned
		options.body = options.body;
	}

	//if no current accessToken available, get new.
	if( !self.accessToken || !this._checkExpired() ) {

		// make the request after getting new token
		self.getAccessToken( function( err, res, body ) {

			if( err ) {
				callback( err );
				return;
			}

			options.headers.Authorization = 'Bearer ' + self.accessToken;

			self._makeRequest( options, callback );
		});
	}
	else {
		options.headers.Authorization = 'Bearer ' + self.accessToken;

		self._makeRequest( options, callback );
	}
};

fuelAuth.prototype._makeRequest = function( options, callback ) {
	request( options, function ( err, res, body ) {
		if( err ) {
			callback( err );
		} else {
			callback( err, res, body );
		}
	});
};

fuelAuth.prototype._checkExpired = function() {
	//if current atomic time is equal or after exp, get new token
	if( this.expiration && process.hrtime()[0] >= this.expiration ) {
		return true;
	} else {
		return false;
	}
};

fuelAuth.prototype._createEnvelope = function( body ) {
	var envelope = '';

	envelope += '<soapenv:Envelope xmlns:soapenv=\'http://schemas.xmlsoap.org/soap/envelope/\'>';
	envelope += '<soapenv:Header>';
	envelope += '<fueloauth xmlns=\'http://exacttarget.com\'>'+this.accessToken+'</fueloauth>';
	envelope += '</soapenv:Header>';
	envelope += '<soapenv:Body>';
	envelope += body;
	envelope += '</soapenv:Body>';
	envelope += '</soapenv:Envelope>';

	return envelope;
};

fuelAuth.version = version;
module.exports   = fuelAuth;
