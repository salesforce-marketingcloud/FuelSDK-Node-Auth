Fuel Node Auth
=============

This library allows users to create authentication clients for ExactTarget APIs. Use our [REST][1] and [SOAP][2] clients to interact with these APIs at a low-level.

## Accessing ExactTarget's API

Making requests to our API should be done using our [REST][1] and [SOAP][2] clients.

This is a new library and requires extensive testing.  We are currently working to develop a test suite, but real world testing is also welcomed. Feel free to test it out and submit issues as they are found.

## API

#### getAccessToken( requestOptions, callback, context, forceRequest )

##### requestOptions

Type: `Object`

Extra options that will be deep merged into options used when token is requested

##### callback

Type: `Function`  

Function that will be executed after token request completes

##### context

Type: `Object`

Context that callback will be executed in.

##### forceRequest

Type: `Boolean`

If true, token will always be requested from API regardless of expiration

#### checkExpired()

Returns boolean value. `true` if token is not expired and it exists. `false` if token is expired or it doesn't exist.



## Setting up the client

```js
var FuelNodeAuth = require( 'fuel-node-auth' );

// Required Settings
var myClientId     = 'yourClientId';
var myClientSecret = 'yourClientSecret';

// Optional Settings
var authUrl = "https://auth.exacttargetapis.com/v1/requestToken"; //this is the default

// Used with SSO - will be created for you if not provided
var refreshToken = "";
var accessToken  = "";
var expiration   = "";

// Create new client - optional settings are passed in here
var FuelAuthClient = new FuelNodeAuth({
	clientId: myClientId // required
	, clientSecret: myClientSecret // required
	, authUrl: authUrl
	, refreshToken: refreshToken
	, accessToken: accessToken
	, expiration: expiration
});
```
## Examples

### Events
```js
var requestOptions = {}; // extra options to be passed in and used on request

// will get called when we have an error
FuelAuthClient.on( 'token:error', function( err ) {
	console.log( err );
});

// will get called when we have a successful token retrieval
FuelAuthClient.on( 'token:success', function( token ) {
	console.log( token );
});

// telling the client to actually get a token
// or return it if it's there and not expired
// requestOptions are not required
FuelAuthClient.getAccessToken( requestOptions );
```

#### Events Emitted

| Event | Fired When... | Data Returned |
| ----- | ------------- | ---- |
| token:success | a token was successfully retrieved. This could mean the token was fetched from the API, or it was just returned because it hadn't expired or returned | `"token-from-api-returned"` |
| token:error | there was an error in the request to the API | error from request |

### Callbacks

```js
// extra options to be passed in and used on request
// has to be an object or null when using callback
var requestOptions = {};

// using a callback without context
FuelAuthClient.getAccessToken( requestOptions, function( err, token ) {
	// function will be executed in context of FuelAuthClient
	console.log( err, token );
});

// using a callback with specfic context
FuelAuthClient.getAccessToken( requestOptions, function( err, token ) {
	// function will be executed in context of global
	console.log( err, token );
}, global );
```

[1]: https://github.com/ExactTarget/Fuel-Node-REST
[2]: https://github.com/ExactTarget/Fuel-Node-SOAP
