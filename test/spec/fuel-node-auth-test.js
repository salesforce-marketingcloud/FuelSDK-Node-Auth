var should   = require( 'should' );
var app      = require( '../app' );
var FuelAuth = require( '../../lib/fuel-auth' );

/*
======== ShouldJS Reference ========

Docs ref for Shouldjs - https://github.com/shouldjs/should.js

====================================
*/

var server;
var client = new FuelAuth({
	"authUrl" : "http://localhost:3000/auth",
	"clientId" : '12345',
	"clientSecret" : '12345'
});


describe('FuelAuth', function () {
	// before(function(){
	// 	server = app.listen(3000);
	// });

	// after(function(){
	// 	server.close();
	// });

	it('should be an object', function(done) {
		client.should.be.an.Object;
		done();
	});
});
