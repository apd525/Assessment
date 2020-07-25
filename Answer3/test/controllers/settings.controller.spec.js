//Declare required
var assert = require('assert');
var expect = require('chai').expect;
var sinon = require('sinon');

var toasterSettingsController =  require('../../controllers/settings.controller');

//Define a test suite
describe('ToasterSettingsController', function () {

	//Define a test module
	describe('readToasterSettings', function(){

		//Declare test data
		let deviceId, defaultSettings , deviceSettings, database;
	
		//Declare hooks
		before(function () {
			//Initialize test data before the first test runs
			deviceId = 'daeadef0-3af1-430f-894d-05690c9d9249';
			defaultSettings = {mode:"toast", level:"3", food:"bread"};
			deviceSettings = {mode:"defrost", level:"4", food:"bagel"};
			
			//Get database service to stub
			database = toasterSettingsController.getDatabase();
		})
  
		//Test case 1
		it('Toaster settings are present in database but error occurs while fetching database record', function(done){
			
			// Setup stubs
			//Stub the getSettings method to throw an exception when called
			const mockDbCall = sinon.stub(database, "getSettings");
			mockDbCall.throws(new Error('Error thrown while fetching data from database'));
			
			// Call the action to be performed
			toasterSettingsController.readToasterSettings(deviceId, function(error, settings){
				//Validate expected error
				expect(error).to.be.an('error');
				expect(error.name).to.be.equal('Error');
				//validate the expected settings
				expect(settings).to.deep.equal(defaultSettings);
				//Verify beheviours
				mockDbCall.restore();
				sinon.assert.calledWith(mockDbCall, deviceId);
				sinon.assert.calledOnce(mockDbCall);
				//Complete
				done();
			});
		});
	
		//Test case 2
		it('Toaster settings are present in database and no error occured while fetching the database record', function(done){
			
			// Setup stubs			
			//Stub the getSettings method to throw an exception when called
			const mockDbCall = sinon.stub(database, "getSettings");
			mockDbCall.returns(deviceSettings);
		  
			// Call the action to be performed
			toasterSettingsController.readToasterSettings(deviceId, function(error, settings){
				//Validate if there was no error
				expect(error).to.be.an('null');		
				//validate the expected settings
				expect(settings).to.deep.equal(deviceSettings);
				//Verify beheviours
				mockDbCall.restore();
				sinon.assert.calledWith(mockDbCall, deviceId);
				sinon.assert.calledOnce(mockDbCall);
				//complete
				done();
			});
		});
	});
});
