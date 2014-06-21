Fuel Node Auth
=============

This library allows users to create authentication clients for ExactTarget APIs. Use our [REST][1] and [SOAP][2] clients to interact with these APIs at a low-level.

###Setting up the client

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
	clientId: myClientId
	, clientSecret: myClientSecret
});

// will get called when we have an error
FuelAuthClient.on( 'token:error', function( err ) {
	'use strict';

	console.log( err );
});

// will get called when we have a successful token retrieval
FuelAuthClient.on( 'token:success', function( token ) {
	// { accessToken: "et28bk6ng36q5ratsk9rhn24", expiresIn: 3600 }
	'use strict';

	console.log( res );
});

// telling the client to actually get a token
// or return it if it's there and not expired
FuelAuthClient.getAccessToken();
```

###API Access

Making requests to our API should be done using our [REST][1] and [SOAP][2] clients.

This is a new library and requires extensive testing.  We are currently working to develop a test suite, but real world testing is also welcomed. Feel free to test it out and submit issues as they are found.

[1]: https://github.com/ExactTarget/Fuel-Node-REST
[2]: https://github.com/ExactTarget/Fuel-Node-SOAP
