var expect          = require( 'chai' ).expect;
var mockServer      = require( '../mock-server' );
var FuelNodeAuth    = require( '../../lib/fuel-node-auth' );
var port            = 4550;
var localhost       = 'http://127.0.0.1:' + port;
var sampleResponses = require( '../sample-responses' );

// we will not be testing for a missing clientId or clientSecret
// since the client cannot be created without those values

describe( 'Function - getAccessToken', function() {
	'use strict';

	var server, AuthClient;

	before( function() {
		server = mockServer( port );
	});

	after(function() {
		server.close();
	});

	it( 'should deliver successful response with an accessToken and expiration', function( done ) {
		AuthClient = new FuelNodeAuth({
			clientId: 'test'
			, clientSecret: 'test'
			, authUrl: localhost + '/v1/requestToken'
		});

		AuthClient.getAccessToken( {}, false, function( err, body ) {
			expect( body ).to.deep.equal( sampleResponses[ '200' ] );
			done();
		});
	});

	it( 'should deliver a 404 when url is not correct', function( done ) {
		AuthClient = new FuelNodeAuth({
			clientId: 'test'
			, clientSecret: 'test'
			, authUrl: localhost + '/'
		});

		AuthClient.getAccessToken( {}, false, function( err, body ) {
			expect( body ).to.deep.equal( sampleResponses[ '404' ] );
			done();
		});
	});

	it( 'should deliver a 401 when clientId and clientSecret are not correct', function( done ) {
		AuthClient = new FuelNodeAuth({
			clientId: 'invalidId'
			, clientSecret: 'invalidSecret'
			, authUrl: localhost + '/v1/requestToken'
		});

		AuthClient.getAccessToken( {}, false, function( err, body ) {
			expect( body ).to.deep.equal( sampleResponses[ '401' ] );
			done();
		});
	});

	it( 'should deliver a 500 when API breaks', function( done ) {
		AuthClient = new FuelNodeAuth({
			clientId: 'test500'
			, clientSecret: 'test500'
			, authUrl: localhost + '/v1/requestToken'
		});

		AuthClient.getAccessToken( {}, false, function( err, body ) {
			expect( body ).to.deep.equal( sampleResponses[ '500' ] );
			done();
		});
	});
});
