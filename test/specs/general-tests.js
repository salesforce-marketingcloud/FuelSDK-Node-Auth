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

var expect   = require( 'chai' ).expect;
var FuelAuth = require( '../../lib/fuel-auth' );

describe( 'General Tests', function() {
	'use strict';

	it( 'should be a constructor', function() {
		expect( FuelAuth ).to.be.a( 'function' );
	});

	it( 'should require clientId and clientSecret', function() {
		var AuthClient;

		// testing with nothing passed into constructor
		try {
			AuthClient = new FuelAuth();
		} catch( err ) {
			expect( err.message ).to.equal( 'options are required. see readme.' );
		}

		// testing with clientId passed into constructor
		try {
			AuthClient = new FuelAuth({
				clientId: 'test'
			});
		} catch( err ) {
			expect( err.message ).to.equal( 'clientId or clientSecret is missing or invalid' );
		}

		// testing with clientSecret passed into constructor
		try {
			AuthClient = new FuelAuth({
				clientSecret: 'test'
			});
		} catch( err ) {
			expect( err.message ).to.equal( 'clientId or clientSecret is missing or invalid' );
		}

		// testing with clientId and clientSecret passed as objects into constructor
		try {
			AuthClient = new FuelAuth({
				clientId: { test: 'test' }
				, clientSecret: { test: 'test' }
			});
		} catch( err ) {
			expect( err.message ).to.equal( 'clientId or clientSecret must be strings' );
		}

		AuthClient = new FuelAuth({
			clientId: 'test'
			, clientSecret: 'test'
		});

		expect( AuthClient ).to.be.a( 'object' );
	});

	it( 'should have getAccessToken on prototype', function() {
		expect( FuelAuth.prototype.getAccessToken ).to.be.a( 'function' );
	});

	it( 'should have isExpired on prototype', function() {
		expect( FuelAuth.prototype.isExpired ).to.be.a( 'function' );
	});
});
