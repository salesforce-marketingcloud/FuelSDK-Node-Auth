Fuel Auth (for Node.js)
=============

This library allows users to create authentication clients for ExactTarget APIs. Use our [REST][1] and [SOAP][2] clients to interact with these APIs at a low-level.

## Accessing ExactTarget's API

Making requests to our API should be done using our [REST][1] and [SOAP][2] clients.

This is a new library and requires extensive testing. Feel free to test it out and submit issues as they are found.

## API

1. **new FuelAuth( options )** - Initialization
    * *options*
        * required: yes
        * type: `Object`
            * clientId - required
            * clientSecred - required
            * authUrl - not required
                * default: https://auth.exacttargetapis.com/v1/requestToken
2. **getAccessToken( requestOptions, forceRequest, callback )**
	* *requestOptions*
		* required: no
		* Type: `Object`
		* Extra options that will be deep merged into options used when token is requested
	* *forceRequest*
		* required: no
		* Type: `Boolean`
		* If true, token will always be requested from API regardless of expiration
	* *callback( error, data )*
		* required: no
		* Type: `Function`  
		* Function that will be executed after token request completes
		* *parameters*
			* error - error encountered. `null` if no error
			* data - object with data and response
				* accessToken ( data.accessToken ) - access token
				* expiresIn ( data.expiresIn ) - time until token expiration
3. **checkExpired()**
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
var accessToken  = ""; // Used with SSO - will be created for you if not provided
var refreshToken = ""; // Used with SSO - will be created for you if not provided

var FuelAuthClient = new FuelAuth({
	clientId: myClientId // required
	, clientSecret: myClientSecret // required
	, authUrl: authUrl
	, accessToken: accessToken
	, refreshToken: refreshToken
});
```
## Examples

### Using Events
```js
var requestOptions = {}; // extra options to be passed in and used on request
var force          = null; // default

// will get called when we have an error in the request to the API
FuelAuthClient.on( 'error', function( err ) {
	console.log( err );
});

// will get called when we have a "successful" response from API (200, 401, 404, 500)
FuelAuthClient.on( 'response', function( data ) {
	// data.accessToken = your token
	// data.expiresIn = how long until token expiration
	console.log( data );
});

// telling the client to get a token from the API
// or return it if it's there and not expired
FuelAuthClient.getAccessToken( requestOptions, force );
```

#### Events Emitted

| Event | Fired When... | Data Returned |
| ----- | ------------- | ---- |
| response | a request was successfully made to the API and a token returned (200), a cached token was returned, or an error from the API (400, 401, 500) was returned | payload from API (200, 400, 401, 500) or cached token |
| error | there was an error in the request to the API (if request module errors)| error from request |

### Using Callbacks

```js
var requestOptions = {}; // extra options to be passed in and used on request
var force          = null; // default

FuelAuthClient.getAccessToken( requestOptions, force, function( err, data ) {
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
* Alex Vernacchia - [twitter](https://twitter.com/vernacchia), [github](https://github.com/vernak2539)
* Doug Wilson - [twitter](https://twitter.com/blipsofadoug), [github](https://github.com/dougwilson)

## ChangeLog
* **0.2.0** - 6/25/14
    * refactored object constructor
    * removed context from getAccessToken API
    * docs/readme updates
* **0.1.1** - 6/23/14
    * readme updates
* **0.1.0** - 6/23/14
    * adding callbacks to getAccessToken API
	* adding ability to pass extra request options to getAccessToken API
	* adding ability to force token request from ExactTarget API
	* adding check for expired token
* **0.0.1** - 6/22/14
    * added event emitter for delivery of data
	* setup travis
	* refactoring of unit tests
	* semantic changes
	* initial commits

[1]: https://github.com/ExactTarget/Fuel-Node-REST
[2]: https://github.com/ExactTarget/Fuel-Node-SOAP
