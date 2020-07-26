{
    init: function(elevators, floors) {
		
		/**
        * Used to remove all matching elements in an array
        * @param {item} item Item to be removed from the array
        */
		Array.prototype.removeAll = function(item) {
            for(var index = this.length; index--;) {
                if(this[index] === item) {
                    this.splice(index, 1);
                }
            }
        }
		
		/**
        * Configure elevator listeners
        * @param {elevator} elevator The elevator object that needs a listener configuration
        */
        function assignElevatorListener(elevator){
			
			//Go to the requested floor after the floor button is pressed
            elevator.on('floor_button_pressed', function(floorNum) {
                elevator.goToFloor(floorNum);
            });
			
			//called when the elevator is idle
			elevator.on("idle", function() {
                determineIfElevatorShouldGoUpOrDown(this);
            });
			
			//called before the elevator passes a floor
			elevator.on("passing_floor", function(floorNum, direction) {
                determineIfElevatorShouldStop(this, floorNum, direction);
            });
			
			//Resets the pending request for a floor when elevator stops on the floor
			elevator.on("stopped_at_floor", function(floorNum) {
				resetDirectionAndPendingRequests(this, floorNum);				
			});
		}
		
		/**
        * Resets the direction indicator of the elevator and resets all pending requests for a floor
        * @param {elevator} elevator The elevator that stopped
		* @param {floorNum} floorNum The floor number at which the elevator has stopped
        */
		function resetDirectionAndPendingRequests(elevator, floorNum) {
			//Reset the direction for top and bottom floor
			elevator.setDirection();
			//If destination queue is not empty move to the next destination
			if(elevator.destinationQueue.length > 0) {
				//set elevator director based on the destination
				elevator.setDirectionBasedOnFloorToVisit(elevator.destinationQueue[0]);
			} else {				
				//determine the direction the elevator should take
				determineIfElevatorShouldGoUpOrDown(elevator);
			}						
			//Remove the current floor from destinationQueue
			elevator.destinationQueue.removeAll(floorNum);
			//Reset floor requests
			floors[floorNum].resetRequests();
			//Set both up and down indicators so that users will enter the elevator 
			//even if the elevator is going in opposite direction
			elevator.goingAnywhere();
		}
		
		/**
        * Determines if the elevator should stop at the floor or not
        * @param {elevator} elevator The elevator that needs direction to stop or not
		* @param {floorNum} floorNum The floor number the elevator is passing through
		* @param {direction} direction The direction in which the elevator is moving
        */
		function determineIfElevatorShouldStop(elevator, floorNum, direction) {
			//Verify if the current floor is in the destinationQueue or not. If yes, the elevator should go to the floor first
			//The elevator should stop at the current floor if there are any pending requests and if elevator has the load capacity
			if(elevator.destinationQueue.includes(floorNum) || (floors[floorNum].pendingRequest(elevator)
				&& elevator.loadFactor() < 0.7 )) {
				//Set current floor as priority destination
				elevator.goToPriorityDestination(floorNum);
			}			
		}
		
		/**
        * Determines if the elevator should go up or down. 
		* The logic to determine the next floor to visit depends upon the direction of elevator 
		* and the closest floor with pending requests
        * @param {elevator} elevator The elevator that needs directions on where to go next
        */
		function determineIfElevatorShouldGoUpOrDown(elevator) {
			//Determine which floor to visit next
			let floorToVisit = determineFloorClosestToElevatorWithPendingRequests(elevator);			
			//Set elevators direction
			elevator.setDirectionBasedOnFloorToVisit(floorToVisit);	
			//Visit the floor
			elevator.goToFloor(floorToVisit, true);					
		}
		
		/**
        * Defines the logic to determine the next floor to visit. 
		* Depending upon the direction of the elevator the closest floor with pending requests will be choosen
        * @param {elevator} elevator The elevator that needs directions on where to go next
		* @returns {number} floorNum The floor number the elevator should visit next
        */
		function determineFloorClosestToElevatorWithPendingRequests(elevator) {
			let allFloors = [];
			let elevatorCurrFloor = elevator.currentFloor();
			
			//Determine if the elevator is going down
			//If it is then reverse the floors to determine the closest floor with pending requests
			if(elevator.goingDownIndicator()) {
				allFloors = floors.slice(0, elevatorCurrFloor).reverse();
			} else {
				allFloors = floors.slice(elevatorCurrFloor + 1);
			}
			
			//Determine if there is a floor closest to the elevator that has pending requests
			let floorToVisit = elevator.assignedFloor;
			for(let index = 0; index < allFloors.length; index++) {
				if(allFloors[index].pendingRequest()) {
					//Get floor number to visit and reset all the pending requests
					floorToVisit = allFloors[index].level;
					allFloors[index].resetRequests();
					break;
				}
			}
			return floorToVisit;
		}
		
		/**
        * Configure helper functions to the elevators
        * @param {elevator} elevator The elevator object that needs helper extensions
        */
		function addHelperFunctionsToElevator(elevator) {
		
			//Sets the going up indicator for a given elevator
			elevator.goingUp = function() {
                this.goingDownIndicator(false);
                this.goingUpIndicator(true);
            }
            
			//Sets the going down indicator for a given elevator
            elevator.goingDown = function() {
                this.goingDownIndicator(true);
                this.goingUpIndicator(false);
            }
			
			//Sets both (up and down) indicators for a given elevator
			elevator.goingAnywhere = function() {
                this.goingDownIndicator(true);
                this.goingUpIndicator(true);
            }
			
			//Sets a priority destination for the elevator
			elevator.goToPriorityDestination = function(floorNum) {
				this.destinationQueue.unshift(floorNum);
				this.checkDestinationQueue();
			}
			
			//Sets the direction of the elevator for top or botton floor
			elevator.setDirection = function() {				
				//If the elevator is at the top floor, the elevator should go down
				if(this.currentFloor() == floors.length - 1) {
					//Set the elevator indicator that its going down
					this.goingDown();
				} else if(this.currentFloor() == 0) {
					//If the elevator is at the lowest floor, the elevator should go up
					//Set the elevator indicator that its going up
					this.goingUp();
				}
			}
			
			//Sets the direction of the elevator depending on where is it
			elevator.setDirectionBasedOnFloorToVisit = function(floorToVisit) {
				//Determine the elevator direction
				if(floorToVisit > elevator.currentFloor()) {
					this.goingUp();
				} else if (floorToVisit < elevator.currentFloor()){
					this.goingDown();
				} else {
					this.setDirection();
				}
			}
			
			//Re-set the indicators at the start for each elevator to set to going up
			elevator.goingUp();
		}
		
		/**
        * Configure helper functions to the floor to convinently access pending requests
        * @param {floor} floor The floor object that needs helper extensions
        */
		function addHelperFunctionsToFloor(floor) {
		
			//determines if the floor has any pending Request
			floor.pendingRequest = function() {
                if(this.buttonState.up || this.buttonState.down) {
					return true;
				}
				return false;
            }          

			//reset pending requests depending on elevator's direction
			floor.resetRequests = function() {
				this.buttonState.up = false;
				this.buttonState.down = false;
            }			
		}
		
        /**
        * Configure floor listeners
        * @param {floor} floor The floor object that needs a listener configuration
        */
        function assignFloorListener(floor){
			
			//Define a variable to hold button's up and down arrow state
			floor.buttonState = { up: false, down: false };
			
			//Set up button's state for a given floor
            floor.on('up_button_pressed', function() {				
                this.buttonState.up = true;
            });
            
			//Set down button's state for a given floor
            floor.on('down_button_pressed', function() {				
                this.buttonState.down = true;
            });
        };
		
		//Configure listener for each elevator
		for (var elevatorNum = 0; elevatorNum < elevators.length; elevatorNum++){
			elevators[elevatorNum].assignedFloor = elevatorNum;
            assignElevatorListener(elevators[elevatorNum]);
			addHelperFunctionsToElevator(elevators[elevatorNum]);
        }
		
		//Configure listener for each floor
        for (var floorNum = 0; floorNum < floors.length; floorNum++){
            assignFloorListener(floors[floorNum]);
			addHelperFunctionsToFloor(floors[floorNum]);
        }   
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}