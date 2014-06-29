var expect     = require( 'chai' ).expect;
var mockServer = require( '../mock-server' );
var FuelAuth   = require( '../../lib/fuel-auth' );
var port       = 4550;
var localhost  = 'http://127.0.0.1:' + port;

describe( 'Function - isExpired', function () {
	'use strict';

	var server;

	before( function() {
		server = mockServer( port );
	});

	after(function() {
		server.close();
	});

	it( 'should return true when there is no expiration set and no accessToken (expired)', function() {
		var AuthClient = new FuelAuth({
			clientId: 'test'
			, clientSecret: 'test'
		});

		expect( AuthClient.isExpired() ).to.be.true;
	});

	it( 'should return true when expiration > process.hrtime()[0] and no accessToken (expired)', function() {
		var AuthClient = new FuelAuth({
			clientId: 'test'
			, clientSecret: 'test'
		});

		AuthClient.expiration = '111111111111';

		expect( AuthClient.isExpired() ).to.be.true;
	});

	it( 'should return false when expiration > process.hrtime()[0] and there is an accessToken (not expired)', function( done ) {
		var AuthClient = new FuelAuth({
			clientId: 'test'
			, clientSecret: 'test'
			, authUrl: localhost + '/v1/requestToken'
		});

		AuthClient.getAccessToken( {}, false, function() {
			expect( this.isExpired() ).to.be.false;
			done();
		}.bind( AuthClient ) );
	});
});
