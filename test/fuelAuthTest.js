'use strict';

var should = require('should');
var fuelAuth = require('../lib/fuelAuth');

/*
======== ShouldJS Reference ========

Docs ref for Shouldjs - https://github.com/shouldjs/should.js

====================================
*/

var validTokens = {"clientId":clientId,"clientSecret":clientSecret};
var validClient = new fuelAuth(validTokens);

var invalidClient1 = new fuelAuth({});
var invalidClient2 = new fuelAuth({"clientId":"iiiiiiiiiiiiiiiiiiiiiiii"});
var invalidClient3 = new fuelAuth({"clientSecret":"ssssssssssssssssssssssss"});



describe('fuelAuth', function () {

});