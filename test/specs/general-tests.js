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

	it( 'should have event emitter on prototype', function() {
		expect( FuelAuth.super_.name ).to.equal( 'EventEmitter' );
	});

	it( 'should have getAccessToken on prototype', function() {
		expect( FuelAuth.prototype.getAccessToken ).to.be.a( 'function' );
	});

	it( 'should have isExpired on prototype', function() {
		expect( FuelAuth.prototype.isExpired ).to.be.a( 'function' );
	});
});
