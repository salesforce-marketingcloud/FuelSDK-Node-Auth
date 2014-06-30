var expect          = require( 'chai' ).expect;
var sinon           = require( 'sinon' );
var mockServer      = require( '../mock-server' );
var FuelAuth        = require( '../../lib/fuel-auth' );
var port            = 4550;
var localhost       = 'http://127.0.0.1:' + port;
var sampleResponses = require( '../sample-responses' );

// we will not be testing for a missing clientId or clientSecret
// since the client cannot be created without those values

describe( 'Function - getAccessToken', function() {
	'use strict';

	var server;

	before( function() {
		server = mockServer( port );
	});

	after(function() {
		server.close();
	});

	it( 'should deliver successful response with an accessToken and expiration', function( done ) {
		var AuthClient = new FuelAuth({
			clientId: 'test'
			, clientSecret: 'test'
			, authUrl: localhost + '/v1/requestToken'
		});

		AuthClient.getAccessToken( {}, false, function( err, body ) {
			expect( body ).to.deep.equal( sampleResponses[ '200' ] );
			done();
		});
	});

	it( 'should deliver successful response with null request options', function( done ) {
		var AuthClient = new FuelAuth({
			clientId: 'test'
			, clientSecret: 'test'
			, authUrl: localhost + '/v1/requestToken'
		});

		AuthClient.getAccessToken( null, false, function( err, body ) {
			expect( body ).to.deep.equal( sampleResponses[ '200' ] );
			done();
		});
	});

	it( 'should deliver cached response with if expiration time/accessToken is valid when requesting', function( done ) {
		var requestSpy = sinon.spy( FuelAuth.prototype, '_requestToken' );

		var AuthClient = new FuelAuth({
			clientId: 'test'
			, clientSecret: 'test'
			, authUrl: localhost + '/v1/requestToken'
		});

		// getting a valid expiration time and valid token
		AuthClient.getAccessToken( {}, false, function() {

			// getting cached token
			AuthClient.getAccessToken( {}, false, function( err, body ) {

				expect( requestSpy.calledOnce ).to.be.true;
				expect( body.expiresIn ).to.be.at.most( 3600 );

				FuelAuth.prototype._requestToken.restore(); // restoring function
				done();
			});
		});
	});

	it( 'should force request even if the expiration time is valid', function( done ) {
		var requestSpy = sinon.spy( FuelAuth.prototype, '_requestToken' );

		var AuthClient = new FuelAuth({
			clientId: 'test'
			, clientSecret: 'test'
			, authUrl: localhost + '/v1/requestToken'
		});

		// getting a valid expiration time and valid token
		AuthClient.getAccessToken( {}, false, function() {

			// forcing new token request
			AuthClient.getAccessToken( {}, true, function() {

				expect( requestSpy.calledTwice ).to.be.true;
				FuelAuth.prototype._requestToken.restore(); // restoring function
				done();
			});
		});
	});

	it( 'should deliver a 404 when url is not correct', function( done ) {
		var AuthClient = new FuelAuth({
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
		var AuthClient = new FuelAuth({
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
		var AuthClient = new FuelAuth({
			clientId: 'test500'
			, clientSecret: 'test500'
			, authUrl: localhost + '/v1/requestToken'
		});

		AuthClient.getAccessToken( {}, false, function( err, body ) {
			expect( body ).to.deep.equal( sampleResponses[ '500' ] );
			done();
		});
	});

	it( 'should return error from request (request module)', function( done ) {
		var errorMsg = 'fake requset error';

		sinon.stub( FuelAuth.prototype, '_requestToken', function( requestOptions, callback ) {
			this._deliverResponse( 'error', errorMsg, callback );
		});

		var AuthClient = new FuelAuth({
			clientId: 'test500'
			, clientSecret: 'test500'
			, authUrl: localhost + '/v1/requestToken'
		});

		AuthClient.getAccessToken( {}, false, function( err ) {
			expect( err ).to.equal( errorMsg );
			FuelAuth.prototype._requestToken.restore(); // restoring function
			done();
		});
	});
});
