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

		AuthClient.getAccessToken( { force: false }, function() {
			expect( this.isExpired() ).to.be.false;
			done();
		}.bind( AuthClient ) );
	});
});
