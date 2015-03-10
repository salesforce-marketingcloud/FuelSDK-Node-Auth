/**
 * Copyright (c) 2014​, salesforce.com, inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided
 * that the following conditions are met:
 *
 *    Redistributions of source code must retain the above copyright notice, this list of conditions and the
 *    following disclaimer.
 *
 *    Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
 *    the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 *    Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
 *    promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

var expect          = require( 'chai' ).expect;
var FuelAuth        = require( '../../lib/fuel-auth' );
var mockServer      = require( '../mock-server' );
var port            = 4550;
var Promiser        = (typeof Promise === 'undefined') ? require('promise') : Promise;
var sampleResponses = require( '../sample-responses' );
var sinon           = require( 'sinon' );

var localhost = 'http://127.0.0.1:' + port;

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

	describe('Callbacks', function() {

		it( 'should deliver successful response with an accessToken and expiration', function( done ) {
			var AuthClient = new FuelAuth({
				clientId: 'test'
				, clientSecret: 'test'
				, authUrl: localhost + '/v1/requestToken'
			});

			AuthClient.getAccessToken( { force: false }, function( err, body ) {
				expect( body ).to.deep.equal( sampleResponses[ '200' ] );
				done();
			});
		});

		it( 'should deliver successful response with no options passed', function( done ) {
			var AuthClient = new FuelAuth({
				clientId: 'test'
				, clientSecret: 'test'
				, authUrl: localhost + '/v1/requestToken'
			});

			AuthClient.getAccessToken( function( err, body ) {
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
			AuthClient.getAccessToken( { force: false }, function() {

				// getting cached token
				AuthClient.getAccessToken( { force: false }, function( err, body ) {

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

			var options = {
				force: false
			};

			// getting a valid expiration time and valid token
			AuthClient.getAccessToken( options, function() {

				options.force = true;

				// forcing new token request
				AuthClient.getAccessToken( options, function() {

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

			AuthClient.getAccessToken( { force: false }, function( err, body ) {
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

			AuthClient.getAccessToken( { force: false }, function( err, body ) {
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

			AuthClient.getAccessToken( { force: false }, function( err, body ) {
				expect( body ).to.deep.equal( sampleResponses[ '500' ] );
				done();
			});
		});

		it( 'should return error from request (request module)', function( done ) {
			var errorMsg = 'fake requset error';

			sinon.stub( FuelAuth.prototype, '_requestToken', function() {
				return new Promiser(function(resolve, reject) {
					reject(errorMsg);
				});
			});

			var AuthClient = new FuelAuth({
				clientId: 'test500'
				, clientSecret: 'test500'
				, authUrl: localhost + '/v1/requestToken'
			});

			AuthClient.getAccessToken( { force: false }, function( err ) {
				expect( err ).to.equal( errorMsg );
				FuelAuth.prototype._requestToken.restore(); // restoring function
				done();
			});
		});
	});

	describe('Promises', function() {

		it( 'should deliver successful response with an accessToken and expiration', function( done ) {
			var AuthClient = new FuelAuth({
				clientId: 'test'
				, clientSecret: 'test'
				, authUrl: localhost + '/v1/requestToken'
			});

			AuthClient.getAccessToken({ force: false })
				.then(function(body) {
					expect(body).to.deep.equal(sampleResponses['200']);
					done();
				})
				.catch(function(err) {
					expect(err).to.not.exist;
				});
		});

		it( 'should deliver successful response with no options passed', function( done ) {
			var AuthClient = new FuelAuth({
				clientId: 'test'
				, clientSecret: 'test'
				, authUrl: localhost + '/v1/requestToken'
			});

			AuthClient.getAccessToken()
				.then(function(body) {
					expect(body).to.deep.equal(sampleResponses['200']);
					done();
				})
				.catch(function(err) {
					expect(err).to.not.exist;
				});
		});

		it( 'should deliver cached response with if expiration time/accessToken is valid when requesting', function( done ) {
			var requestSpy = sinon.spy( FuelAuth.prototype, '_requestToken' );

			var AuthClient = new FuelAuth({
				clientId: 'test'
				, clientSecret: 'test'
				, authUrl: localhost + '/v1/requestToken'
			});

			var options = {
				force: false
			};

			// getting a valid expiration time and valid token
			AuthClient.getAccessToken(options)
				.then(function() {
					// getting cached token
					AuthClient.getAccessToken(options)
						.then(function(body) {
							expect( requestSpy.calledOnce ).to.be.true;
							expect( body.expiresIn ).to.be.at.most( 3600 );

							FuelAuth.prototype._requestToken.restore();
							done();
						})
						.catch(function(err) {
							expect(err).to.not.exist;
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

			var options = {
				force: false
			};

			// getting a valid expiration time and valid token
			AuthClient.getAccessToken(options)
				.then(function() {

					options.force = true;

					// forcing new token request
					AuthClient.getAccessToken(options)
						.then(function() {
							expect( requestSpy.calledTwice ).to.be.true;
							FuelAuth.prototype._requestToken.restore();
							done();
						})
						.catch(function(err) {
							expect(err).to.not.exist;
						});
				});
		});

		it( 'should return error from request (request module)', function( done ) {
			var errorMsg = 'fake requset error';

			sinon.stub( FuelAuth.prototype, '_requestToken', function() {
				return new Promiser(function(resolve, reject) {
					reject(errorMsg);
				});
			});

			var AuthClient = new FuelAuth({
				clientId: 'test500'
				, clientSecret: 'test500'
				, authUrl: localhost + '/v1/requestToken'
			});

			AuthClient.getAccessToken({ force: false })
				.then(function(body) {
					expect(body).to.not.exist;
				})
				.catch(function(err) {
					expect( err ).to.equal( errorMsg );
					FuelAuth.prototype._requestToken.restore(); // restoring function
					done();
				});
		});
	});
});
