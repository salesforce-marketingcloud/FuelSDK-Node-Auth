// testing libraries
var expect = require( 'chai' ).expect;

// module to test
var FuelNodeAuth = require( '../lib/fuel-node-auth' );

describe( 'General Tests', function() {
	'use strict';

	it( 'should be a constructor', function() {
		expect( FuelNodeAuth ).to.be.a( 'function' );
	});

	it( 'should require clientId and clientSecret', function() {
		var AuthClient;

		// testing with nothing passed into constructor
		try {
			AuthClient = new FuelNodeAuth();
		} catch( err ) {
			expect( err.message ).to.equal( 'clientId or clientSecret is missing or invalid' );
		}

		// testing with clientId passed into constructor
		try {
			AuthClient = new FuelNodeAuth({
				clientId: 'test'
			});
		} catch( err ) {
			expect( err.message ).to.equal( 'clientId or clientSecret is missing or invalid' );
		}

		// testing with clientSecret passed into constructor
		try {
			AuthClient = new FuelNodeAuth({
				clientSecret: 'test'
			});
		} catch( err ) {
			expect( err.message ).to.equal( 'clientId or clientSecret is missing or invalid' );
		}

		// testing with clientId and clientSecret passed as objects into constructor
		try {
			AuthClient = new FuelNodeAuth({
				clientId: { test: 'test' }
				, clientSecret: { test: 'test' }
			});
		} catch( err ) {
			expect( err.message ).to.equal( 'clientId or clientSecret must be strings' );
		}

		AuthClient = new FuelNodeAuth({
			clientId: 'test'
			, clientSecret: 'test'
		});

		expect( AuthClient ).to.be.a( 'object' );
	});

	it( 'should have event emitter on prototype', function() {
		expect( FuelNodeAuth.super_.name ).to.equal( 'EventEmitter' );
	});

	it( 'should have getAccessToken on prototype', function() {
		expect( FuelNodeAuth.prototype.getAccessToken ).to.be.a( 'function' );
	});

	it( 'should have isExpired on prototype', function() {
		expect( FuelNodeAuth.prototype.isExpired ).to.be.a( 'function' );
	});
});
