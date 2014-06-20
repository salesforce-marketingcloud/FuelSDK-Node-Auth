Fuel Node Auth
=============

This library allows users to create authentication clients for ExactTarget APIs. Use our [REST][1] and [SOAP][2] clients to interact with these APIs at a low-level.


###Setting up the client

```js
var FuelNodeAuth = require( 'fuel-node-auth' );

// Required Settings
var clientId     = 'yourClientId';
var clientSecret = 'yourClientSecrete';

// Optional Settings
var authUrl = "https://auth.exacttargetapis.com/v1/requestToken"; //this is the default

// Used with SSO - will be created for you if not provided
var refreshToken = "";
var accessToken  = "";
var expiration   = "";


// Create new client - optional settings are passed in here
var client = new FuelNodeAuth({ "clientId": clientId, "clientSecret": clientSecret });
```

###API Access

Making requests to our API should be done using our [REST][1] and [SOAP][2] clients.

This is a new library and requires extensive testing.  We are currently working to develop a test suite, but real world testing is also welcomed. Feel free to test it out and submit issues as they are found.

[1]: https://github.com/ExactTarget/Fuel-Node-REST
[2]: https://github.com/ExactTarget/Fuel-Node-SOAP
