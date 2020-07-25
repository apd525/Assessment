/**
 * Controller to retrieve settings for a device from database  
 */
function SettingsController() {

	/**
	 * Create a dummy database service with getSettings fucntion
	 */
	var Database = {
		//Define a function to get device settings from database
		getSettings: function(deviceId) {
		  //get settings from database for given device id
		  return;
		}
	}
  
	/**
	 * Returns an instanceof database service
	 * The instance will be useful for creating stubs for database operations
	 * @return {Database} instanceof database service
	 */
	function getDatabase() {
		return Database;
	}

	/**
	 * Returns the default settings for a device
	 * @return {DeviceSettings} returns an object of device settings
	 */
	function getDefaultSettings() {
		return {mode:"toast", level:"3", food:"bread"};
	}
	
	/**
	* @brief This function loads a toaster’s settings from the database. If
	* there is an error, an error will be returned along with default
	* settings from the getDefaultSettings() function. If there are no
	* settings, it will return the default settings from the
	* getDefaultSettings() function.
	*
	* @param id - unique id of the toaster
	* @param callback - the callback function takes (error, data) objects.
	* @return {number} x raised to the n-th power.
	*/
	function readToasterSettings(deviceId, callback) {
		let settings = null;
		try{
			//Fetch the setings for a toaster from the database
			settings = Database.getSettings(deviceId);
		} catch(error) {
			//On error return the error and default settings
			callback(error, getDefaultSettings());
			return;
		} 
		if(settings) {
			//If settings were retrieve return it
			callback(null, settings);
		} else {
			//Return default settings
			callback(null, getDefaultSettings());
		}
	}

  return {
    readToasterSettings,
	getDatabase
  }

}

module.exports = SettingsController();
