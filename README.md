Fuel Auth (for Node.js) [![Build Status](https://travis-ci.org/ExactTarget/Fuel-Node-Auth.svg)](https://travis-ci.org/ExactTarget/Fuel-Node-Auth)
=============

This library allows users to create authentication clients for ExactTarget APIs.

<!-- Use our [REST][1] and [SOAP][2] clients to interact with these APIs at a low-level. -->

This library is compatible with node versions 0.8 and 0.10+. `npm install` will error if you're using node version 0.8 with developer dependencies. To have a successful install for testing/contributing use `npm install -g npm@1.2.8000` and the issue should be resolved.

## Accessing ExactTarget's API

<!--
Making requests to our API should be done using our [REST][1] and [SOAP][2] clients.
-->

This is a new library and requires extensive testing. Feel free to test it out and submit issues as they are found.

## Initialization
**new FuelAuth( options )**
* *options*
	* required: yes
	* Type: `Object`
		* clientId - required
		* clientSecret - required
		* authUrl - not required
			* default: https://auth.exacttargetapis.com/v1/requestToken
		* scope - not required
			* can be used to set a client context when a refreshToken is not available

## API

1. **getAccessToken( options, callback )**
	* `options`
		* required: no
		* Type: `Object`
		* Extra options used on token request. See [request modules options][3]
	* `options.force`
		* required: no
		* Type: `Boolean`
		* default: `false`
		* If true, token will always be requested from API regardless of expiration
	* `callback( error, data )`
		* required: yes
		* Type: `Function`  
		* Function that will be executed after token request completes
		* *parameters*
			* error - error encountered. `null` if no error
			* data - object with data and response
				* accessToken ( data.accessToken ) - access token
				* expiresIn ( data.expiresIn ) - time until token expiration
2. **checkExpired()**
	* Returns boolean value. `true` if token is not expired and it exists. `false` if token is expired or it doesn't exist.

## Setting up the client

```js
var FuelAuth = require( 'fuel-auth' );

// Required Settings
var myClientId     = 'yourClientId';
var myClientSecret = 'yourClientSecret';

// Minimal Initialization
var FuelAuthClient = new FuelAuth({
	clientId: myClientId // required
	, clientSecret: myClientSecret // required
});

// Initialization with extra options
var authUrl      = "https://auth.exacttargetapis.com/v1/requestToken"; //this is the default
var accessToken  = "";
var refreshToken = "";

var FuelAuthClient = new FuelAuth({
	clientId: myClientId // required
	, clientSecret: myClientSecret // required
	, authUrl: authUrl
	, accessToken: accessToken
	, refreshToken: refreshToken
});
```
## Examples

```js
var options = {
	// whatever request options you want
	// See https://github.com/mikeal/request#requestoptions-callback

	// I want to force a request
	force: true
};

FuelAuthClient.getAccessToken( options, function( err, data ) {
	if( !!err ) {
		console.log( err );
		return;
	}

	// data.accessToken = your token
	// data.expiresIn = how long until token expiration
	console.log( data );
});

// OR don't pass any options
FuelAuthClient.getAccessToken( function( err, data ) {
	if( !!err ) {
		console.log( err );
		return;
	}

	// data.accessToken = your token
	// data.expiresIn = how long until token expiration
	console.log( data );
});
```
## Contributors

*In alphabetical order*

* Kelly Andrews - [twitter](https://twitter.com/kellyjandrews), [github](https://github.com/kellyjandrews)
* David Brainer-Banker - [twitter](https://twitter.com/TweetTypography), [github](https://github.com/tweettypography)
* Alex Vernacchia - [twitter](https://twitter.com/vernacchia), [github](https://github.com/vernak2539)
* Doug Wilson - [twitter](https://twitter.com/blipsofadoug), [github](https://github.com/dougwilson)

## Contributing

We welcome all contributions and issues! There's only one way to make this better, and that's by using it. If you would like to contribute, please checkout our [guidelines](https://github.com/ExactTarget/Fuel-Node-Auth/wiki/Contributing)!

## ChangeLog

* **0.5.2** - 2014-10-16 - added easier way to use scope option when requesting token
* **0.5.1** - 2014-08-19 - fixed Travis CI testing for 0.8 and 0.10
* **0.5.0** - 2014-08-06 - updated request dependency version due to qs module security vulnerability
* **0.4.0** - 2014-08-06 - removed event emitter - *breaking*
* **0.3.0** - 2014-08-05 - getAccessToken API change - *breaking*
* **0.2.1** - 2014-08-05
    * completed unit tests
    * npm package update
    * changing require name to `fuel-auth`
    * added license
    * readme update
* **0.2.0** - 2014-06-25
    * refactored object constructor
    * removed context from getAccessToken API
    * docs/readme updates
* **0.1.1** - 2014-06-23 - readme updates
* **0.1.0** - 2014-06-23
    * adding callbacks to getAccessToken API
	* adding ability to pass extra request options to getAccessToken API
	* adding ability to force token request from ExactTarget API
	* adding check for expired token
* **0.0.1** - 2014-06-22
    * added event emitter for delivery of data
	* setup travis
	* refactoring of unit tests
	* semantic changes
	* initial commits

[1]: https://github.com/ExactTarget/Fuel-Node-REST
[2]: https://github.com/ExactTarget/Fuel-Node-SOAP
[3]: https://github.com/mikeal/request#requestoptions-callback
