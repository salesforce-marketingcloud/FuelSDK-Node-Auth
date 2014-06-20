Fuel-Node-Auth
=============

The Fuel Node Auth library allows users to create new authenticated clients to help manage tokens.


###Set up a new client

```
//Required Settings
var clientId = 'yourClientId';
var clientSecret = 'yourClientSecrete';

//Optional Settings
var authUrl = "https://auth.exacttargetapis.com/v1/requestToken" //this is the default


//Used with SSO - will be created for you if not provided
var refreshToken = "" 
var accessToken = ""
var expiration = ""


//Create new client - optional settings are passed in here
var client = new fuelAuth({"clientId":clientId, "clientSecret":clientSecret});

```
