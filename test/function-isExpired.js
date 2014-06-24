// testing libraries
var expect = require( 'chai' ).expect;

// module to test
var FuelNodeAuth = require( '../lib/fuel-node-auth' );

describe( 'Function - isExpired', function () {
	'use strict';

	it( 'should return false when token is not expired and accessToken is present', function() {
		var AuthClient = new FuelNodeAuth({
			clientId: 'test'
			, clientSecret: 'test'
			, expiration: 3600 // faking
		});

		AuthClient.accessToken = '1234556778866'; // faking that we have an accessToken

		expect( AuthClient.isExpired() ).to.be.false;
	});

	it( 'should return true when token is expired based on time', function( done ) {
		var AuthClient = new FuelNodeAuth({
			clientId: 'test'
			, clientSecret: 'test'
			, expiration: 1 // faking
		});

		AuthClient.accessToken = '1234556778866'; // faking that we have an accessToken

		setTimeout( function() {
			expect( AuthClient.isExpired() ).to.be.true;
			done();
		}, 1000 );
	});

	it( 'should return true when there is no accessToken but has not expired based on time', function() {
		var AuthClient = new FuelNodeAuth({
			clientId: 'test'
			, clientSecret: 'test'
			, expiration: 3600 // faking
		});

		expect( AuthClient.isExpired() ).to.be.true;
	});
});
