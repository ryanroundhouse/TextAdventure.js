// === Debug Variable ===
var debugMode = false;

// === Import Necessary Functionality ===
var fileSystem = require('fs');
var parser = require('./parser.js');
var helper = require('../helper/helper.js');

// === Creat Necessary Variables ===
var games = {};

// ----------------------------\
// === Main Function ==================================================================================================
// ----------------------------/
exports.input = function(input, gameID){
	var command = parser.parse(input);
	var game = games[gameID];
	if(game){
		var gameActions = game.gameActions;
		game = game.gameData;
		++game.commandCounter;
		var returnString;
		console.log(gameID + ': ' + game.commandCounter);
		try {
			try {
				debug('---Attempting to run cartridge command "'+command.action+'"');
				returnString = eval('gameActions.'+command.action+'(game,command,consoleInterface)');
			} catch(cartridgeCommandError) {
				debug('-----'+cartridgeCommandError);
				debug('---Attempting to run cartridge command "'+command.action+'"');
				returnString = eval('actions.'+command.action+'(game,command)').message;
			}
		} catch(consoleCommandError){
			try {
				debug('-----'+consoleCommandError);
				debug('---Attempting to perform '+command.action+' interaction');
				returnString = interact(game, command.action, command.subject);
			} catch (interactionError) {
				debug('-----'+interactionError);
			}
		}
		if(returnString === undefined){
			returnString = "I don't know how to do that.";
		} else {
			try {
				var updateLocationString = getCurrentLocation(game).updateLocation(command);
			} catch(updateLocationError){
				debug('---Failed to Perform updateLocation()');
				debug('-----'+updateLocationError);
			}
		}
		if(updateLocationString !== undefined){
			returnString = updateLocationString;
		}
		return helper.checkForGameEnd(game, returnString, actions);
	} else {
		console.log(gameID + ': no game');
		if(command.action === 'load'){
			return loadCartridge(gameID, command.subject);
		} else {
			return listCartridges();
		}
	}
};

// ----------------------------\
// === Game Setup Functions ===========================================================================================
// ----------------------------/
function listCartridges(){
	var cartridges = fileSystem.readdirSync('./cartridges/').filter(function(file){
		return file && file[0] != '.';
	});
	if (cartridges.length === 0){
		return 'No game cartridges found.'
	}
	var cartridgesFormated = 'Available Games: \n';
	for(var i = 0; i < cartridges.length; i++){
		cartridgesFormated = cartridgesFormated.concat(cartridges[i].substr(0,cartridges[i].lastIndexOf('.')));
		if(i < cartridges.length-1){
			cartridgesFormated = cartridgesFormated.concat('\n');
		}
	}
	return cartridgesFormated;
}

function loadCartridge(gameID, gameName){
	if (!gameName){
		return "Specify game cartridge to load.";
	}
	try {
		delete require.cache[require.resolve('../cartridges/'+gameName+'.js')];
		var file = require('../cartridges/'+gameName+'.js');
		games[gameID] = {gameData: file.gameData, gameActions: file.gameActions};
		games[gameID].gameData.gameID = gameID;
		return games[gameID].gameData.introText + '\n' + getLocationDescription(games[gameID].gameData);
	} catch(error){
		return "Could not load " + gameName;
	}
}

// ----------------------------\
// === Console Actions =================================================================================================
// ----------------------------/
var actions = {

	die : function(game, command){
		delete games[game.gameID];
		return {message:'You are dead', success: true};
	},

	drop : function(game, command){
		if(!command.subject){
			return {message: 'What do you want to drop?', success: false};
		}
		try{
			return {message: interact(game, 'drop', command.subject), success: true};
		} catch(error) {
			try {
				var currentLocation = getCurrentLocation(game);
				helper.moveItem(command.subject, game.player.inventory, currentLocation.items);
				var item = helper.getItem(currentLocation.items, command.subject);
				item.hidden = false;
				return {message: command.subject + ' dropped', success: true};
			} catch(error2){
				return {message: 'You do not have '+ helper.aOrAn(command.subject.charAt(0)) + command.subject + ' to drop.', success: false};
			}
		}
	},

	go : function(game, command){
		if(!command.subject){
			return {message: 'Where do you want to go?', success: false};
		}
		var exits = getCurrentLocation(game).exits;
		var playerDestination = null
		try {
			playerDestination = exits[command.subject].destination;
		} catch (error) {
			for(var exit in exits){
				var exitObject = exits[exit];
				if(exitObject.displayName.toLowerCase() === command.subject){
					playerDestination = exitObject.destination;
				}
			}
		}
		if(playerDestination === null){
			return {message: 'You can\'t go there.', success: false};
		}
		getCurrentLocation(game).firstVisit = false;
		if (getCurrentLocation(game).teardown !== undefined){
			getCurrentLocation(game).teardown();
		}
		if (game.map[playerDestination].setup !== undefined){
			game.map[playerDestination].setup();
		}
		game.player.currentLocation = playerDestination;
		return {message: getLocationDescription(game), success: true};
	},

	inventory : function(game, command){
		var inventoryList = 'Your inventory contains:';
		for (var item in game.player.inventory){
			var itemObject = game.player.inventory[item];
			var itemName = itemObject.displayName;
			if(itemObject.quantity > 1){
				itemName = itemName.concat(' x'+itemObject.quantity);
			}
			if (itemObject.equiped){
				itemName = itemName.concat(' (equipped)');
			}
			inventoryList = inventoryList.concat('\n'+itemName);
		}
		if (inventoryList === 'Your inventory contains:'){
			return {message: 'Your inventory is empty.', success: true};
		} else {
			return {message: inventoryList, success: true};
		}
	},

	look : function(game, command){
		if(!command.subject){
			return {message: getLocationDescription(game, true), success: true};
		}
		try {
			try {
				return {message: helper.getItem(game.player.inventory, command.subject).description, success: true};
			} catch (itemNotInInventoryError){
				return {message: helper.getItem(getCurrentLocation(game).items, command.subject).description, success: true};
			}
		} catch(isNotAnItemError) {
			try {
				return {message: interact(game, 'look', command.subject), success: true};
			} catch(subjectNotFound
				) {
				return {message: 'There is nothing important about the '+command.subject+'.', success: false};
			}
		}
	},

	take : function(game, command){
		if(!command.subject){
			return {message: 'What do you want to take?', success: false};
		}
		try{
			return {message: interact(game, 'take', command.subject), success: true};
		} catch(error) {
			try {
				helper.moveItem(command.subject, getCurrentLocation(game).items, game.player.inventory);
				return {message: command.subject + ' taken', success: true};
			} catch(error2){
				return {message: 'Best just to leave the ' + command.subject + ' as it is.', success: false};
			}
		}
    },
    
    talk : function (game, command) {
        if (!command.subject) {
            return { message: 'You grumble to yourself about your current state of affairs.', success: false };
        }
        try {
            return { message: getActor(game, command.subject).talk(), success: true };
        } catch (noTalkFunction) {
            try {
                return { message: getActor(game, command.subject).talk, success: true };
            }
            catch (noTalkMessage) {
                return { message: 'There\'s no ' + command.subject + ' to talk to.', success: false };
            }
        }
    },

	use : function(game, command){
		if(!command.subject){
			return {message: 'What would you like to use?', success: false};
		}
		try {
			return {message: helper.getItem(game.player.inventory, command.subject).use(), success: true};
		} catch (itemNotInInventoryError) {
			return {message: 'Can\'t do that.', success: false};
		}
	},
	
	wear : function(game, command){
		if (!command.subject){
			return {message: 'What do you want to wear?', success: false};
		}
		try{
			return {message: helper.getItem(game.player.inventory, command.subject).wear(), success: true}
		} catch(subjectNotFound){
			return {message: 'You can\'t wear '+ helper.aOrAn(command.subject.charAt(0)) + command.subject, success: false};
		}
	}
};


// ----------------------------\
// === Helper Functions ===============================================================================================
// ----------------------------/
function consoleInterface(game, command){
	return eval('actions.'+command.action+'(game,command);')
}

function debug(debugText){
	if(debugMode){
		console.log(debugText);
	}
}

function exitsToString(exitsObject){
	var numOfExits = Object.keys(exitsObject).length;
	if(numOfExits === 0){
		return '';
	}
	var visibleExits = [];
	for(var exit in exitsObject){
		var exitObject = exitsObject[exit];
		if(!exitObject.hidden){
			visibleExits.push(exitObject.displayName);
		}
	}
	switch(visibleExits.length){
		case 0:
			return '';
		case 	1:
			var returnString = ' Exit is ';
			break;
		default :
			var returnString = ' Exits are ';
	}
	for(i=0; i<visibleExits.length; ++i){
		returnString = returnString.concat(visibleExits[i]);
		if(i === visibleExits.length-2){
			returnString = returnString.concat(' and ');
		} else if (i === visibleExits.length-1){
			returnString = returnString.concat('.');
		} else {
			returnString = returnString.concat(', ');
		}
	}
	return returnString;
}

function getCurrentLocation(game){
	return game.map[game.player.currentLocation];
}

function getLocationDescription(game, forcedLongDescription){
	var currentLocation = getCurrentLocation(game);
	var description;
	if(currentLocation.firstVisit || forcedLongDescription){
        description = currentLocation.description;
        if (currentLocation.interactables) {
            description = description.concat(interactablesToString(currentLocation.interactables));
        }
		if(currentLocation.items){
			description = description.concat(itemsToString(currentLocation.items));
        }
        if (currentLocation.actors) {
            description = description.concat(actorsToString(currentLocation.actors));   
        }
		if(currentLocation.exits){
			description = description.concat(exitsToString(currentLocation.exits));
		}
	} else {
		description = currentLocation.displayName;
	}
	return description;
}

function actorsToString(actorsObject) {
    var numOfActors= Object.keys(actorsObject).length;
    if (numOfActors === 0) {
        return '';
    }
    var visibleActors = [];
    for (var actor in actorsObject) {
        var actorObject = actorsObject[actor];
        if (!actorObject.hidden) {
            visibleActors.push({ description: actorObject.description });
        }
    }
    if (visibleActors.length === 0) {
        return '';
    }
    var returnString = ' Milling about the area, you see ';
    for (i = 0; i < visibleActors.length; ++i) {
        returnString = returnString.concat(visibleActors[i].description);
        if (i === visibleActors.length - 2) {
            returnString = returnString.concat(' and ');
        } else if (i === visibleActors.length - 1) {
            returnString = returnString.concat('.');
        } else {
            returnString = returnString.concat(', ');
        }
    }
    return returnString;
}

function itemsToString(itemsObject){
	var numOfItems = Object.keys(itemsObject).length;
	if(numOfItems === 0){
		return '';
	}
	var visibleItems = [];
	for(var item in itemsObject){
		var itemObject = itemsObject[item];
		if(!itemObject.hidden){
			visibleItems.push({name:itemObject.displayName, quantity:itemObject.quantity});
		}
	}
	if(visibleItems.length === 0){
		return '';
	}
	if(visibleItems[0].quantity === 1){
		var returnString = ' There is ';
	} else {
		var returnString = ' There are ';
	}
	for(i=0; i<visibleItems.length; ++i){
		if(visibleItems[i].quantity > 1){
			returnString = returnString.concat(visibleItems[i].quantity+' '+visibleItems[i].name+'s');
		} else {
			returnString = returnString.concat(helper.aOrAn(visibleItems[i].name.charAt(0))+visibleItems[i].name);
		}
		if(i === visibleItems.length-2){
			returnString = returnString.concat(' and ');
		} else if (i === visibleItems.length-1){
			returnString = returnString.concat(' here.');
		} else {
			returnString = returnString.concat(', ');
		}
	}
	return returnString;
}

function interactablesToString(interactablesObject) {
    var numOfInteractables = Object.keys(interactablesObject).length;
    if (numOfInteractables === 0) {
        return '.';
    }
    var visibleInteractables = [];
    for (var interactable in interactablesObject) {
        var interactableObject = interactablesObject[interactable];
        if (!interactableObject.hidden && interactableObject.description != null) {
            visibleInteractables.push({ description: interactableObject.description });
        }
    }
    if (visibleInteractables.length === 0) {
        return '.';
    }
    var returnString = '';
    for (i = 0; i < visibleInteractables.length; ++i) {
        if (i == 0) {
            returnString = returnString.concat(' ');
        }
        else if (i < visibleInteractables.length-1) {
            returnString = returnString.concat(', ');
        }
        else if (i+1 === visibleInteractables.length) {
            returnString = returnString.concat(' and ');
        }
        returnString = returnString.concat(visibleInteractables[i].description);
    }
    returnString = returnString.concat('.');
    return returnString;
}

function getActor(game, subject) {
    var actor = getCurrentLocation(game).actors[subject];
    return actor;
}

function interact(game, interaction, subject){
	try{
        var message = getCurrentLocation(game).items[subject].interactions[interaction];
        return message;
    } catch (notAnItemError) {
        try {
            var message = getCurrentLocation(game).actors[subject][interaction];
            return message;
        }
        catch (notAnActorError) {
            var message = getCurrentLocation(game).interactables[subject][interaction]();
            return message;
        }
	}
}

