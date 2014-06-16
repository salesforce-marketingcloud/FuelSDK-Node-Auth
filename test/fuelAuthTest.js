'use strict';

var should = require('should');
var fuelAuth = require('../lib/fuelAuth');

/*
======== ShouldJS Reference ========

Docs ref for Shouldjs - https://github.com/shouldjs/should.js

====================================
*/
var clientId = 'zhkxbrhjtcsa5567wskxcgbb';
var clientSecret = '2sWqrfxaakJjbbdXt4vVmJnT';
var validTokens = {"clientId":clientId,"clientSecret":clientSecret};
var validClient = new fuelAuth(validTokens);

var invalidClient1 = new fuelAuth({});
var invalidClient2 = new fuelAuth({"clientId":"iiiiiiiiiiiiiiiiiiiiiiii"});
var invalidClient3 = new fuelAuth({"clientSecret":"ssssssssssssssssssssssss"});



describe('fuelAuth', function () {

	it('should verify clientId and clientSecret', function(done) {
		
		validClient._verifyClient.should.be.a.Function;

		invalidClient1.should.throwError();
		invalidClient1.message.should.equal('clientId and clientSecret are missing or invalid');
		
		invalidClient2.should.throwError();
		invalidClient2.message.should.equal('clientSecret is missing or invalid');
		
		invalidClient3.should.throwError();
		invalidClient3.message.should.equal('clientId is missing or invalid');
		
		done();

	});

	it('should be an object', function(done) {
		validClient.should.be.an.Object;
		done();
	});

});

describe('getAccessToken', function () {

	it('should be a function', function(done) {
		validClient.getAccessToken.should.be.a.Function;
		done();
	});

	it('should return with accessToken to the fuelAuth object', function(done) {
		validClient.getAccessToken(function(error, response, body){
			body.accessToken.should.be.ok;
			done();
		})
		
	});

	it('should refresh token if expired', function(done) {
		done();
	});

});

describe('SOAP Calls', function () {
	it('should be a function', function(done) {
		validClient.soapRequest.should.be.a.Function;
		done();
	});
});

describe('REST Calls', function () {
	it('should be a function', function(done) {
		validClient.restRequest.should.be.a.Function;
		done();
	});
});