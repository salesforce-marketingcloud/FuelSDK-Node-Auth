var	version = '0.0.1';
var http 	= require('http'),
	_ 		= require('underscore'),
	xml2js	= require('xml2js'),
	request = require('request');



var fuelAuth = function(options) {

	if (!(this instanceof fuelAuth)) return new fuelAuth(options);

  	var defaults = {
		"clientId" : null,
		"clientSecret" : null,
		"authUrl" : "https://auth.exacttargetapis.com/v1/requestToken",
		"soapEndpoint": "https://webservice.exacttarget.com/Service.asmx",
		"restEndpoint" : "https://www.exacttargetapis.com/",
		"refreshToken" : "",
		"accessToken" : "",
		"customHeaders" : {},
		"expiration" : ""
	};

	options = merge(defaults, options);
	
	//make sure clientId and clientSecret are available and not empty
	if (!options.clientId || !options.clientSecret) {
		throw new Error('clientId or clientSecret is missing or invalid');
	}

	//set required
	this.clientId= options.clientId;
	this.clientSecret= options.clientSecret;
	this.authUrl= options.authUrl;
	this.soapEndpoint= options.soapEndpoint;
	this.restEndpoint= options.restEndpoint;

	//set optionals
	if (options.customHeaders === {}) this.customHeaders = options.customHeaders;
	if (options.expiration) this.expiration = options.expiration;
	if (options.refreshToken) this.refreshToken = options.refreshToken;
	if (options.accessToken) this.refreshToken = options.accessToken;	
};

fuelAuth.prototype.getAccessToken = function(callback) {
	//set auth options for request
	var options = {
		'url': this.authUrl,
		'method': 'POST',
		'json': {
			'clientId': this.clientId,
			'clientSecret': this.clientSecret
		}
	};

	if (this.refreshToken) options.json.refreshToken = this.refreshToken;

	var self = this;

	request(options, function (error, response, body) {
		if (error) {
			callback(error);
		} else {
			if (body && body.refreshToken) {
				self.refreshToken = body.refreshToken;
			}
			self.accessToken = body.accessToken;
			self.expiration = process.hrtime()[0] + body.expiresIn;
			callback(error, response, body);
		}
	});
};

fuelAuth.prototype.soapRequest = function(options, callback) {
};


fuelAuth.prototype.restRequest = function(options, callback) {

	var self = this;

	var defaults = {
		method: 'GET', 
		headers: {
			'User-Agent' : 'node-fuel/' + fuelAuth.version,
		},
		json : true
	};

	options = merge(defaults, options);

	options.url = self.restEndpoint + options.url;
	options.method = options.method;
	options.json = options.json;
	if (options.body) options.body = options.body;

	//if no current accessToken available, get new.
	if (!self.accessToken || !this._checkExpired()) {
		// make the request after getting new token
		console.log("needs a new token");
		self.getAccessToken(function(error, response, body){
			if (error) {
				callback(error);
			} 
			else {
				options.headers.Authorization = "Bearer " + self.accessToken;
				self._makeRequest(options,callback);
			}
		});
	} 	
	else {
		options.headers.Authorization = "Bearer " + self.accessToken;
		self._makeRequest(options,callback);
	}
};

fuelAuth.prototype._makeRequest = function(options,callback) {
	var self = this;
	console.log(options);
	request(options, function (error, response, body) {
		if (error) {
			callback(error);
		} else {
			callback(error, response, body);
		}
	});
};

fuelAuth.prototype._checkExpired = function() {
	//if current atomic time is equal or after exp, get new token
	if (this.expiration && process.hrtime()[0] >= this.expiration) {
		return true;
	} else {
		return false;
	}
};


fuelAuth.version = version;
module.exports = fuelAuth;

function merge(defaults, options) {
	defaults = defaults || {};
	if (options && typeof options === 'object') {
		var keys = Object.keys(options);
		for (var i = 0, len = keys.length; i < len; i++) {
			var k = keys[i];
			if (options[k] !== undefined) defaults[k] = options[k];
		}
	}
	return defaults;
}