var helper = require('../helper/helper.js');

// === Game Data ===
var gameData = {
    commandCounter : 0,
    gameOver : false,
    introText : 'Welcome to the Crooked Gulch Gold Mine. What it lacks in safety precautions it more than makes up for in gold. Watch your step and you might just make it out with riches beyond your wildest imagination!',
    outroText : 'Thanks For playing!',
    player : {
        currentLocation : 'MineEntrance',
        inventory : {},
        lightSource : false
    },
    map : {
        'MineEntrance' : {
            firstVisit : true,
            displayName : 'Mine Entrance',
            description : 'You stand at the partially collapsed entrance to the mine. Nearby there is',
            interactables : {
                helmets : {
                    look : 'It is a pile of miner helmets with lights on them. They seem to still be operational.',
                    description : 'a sign sticking out of a pile of miner helmets',
                    hidden : false
                },
                sign : { look : 'The sign reads "Crooked Gulch Gold Mine" and has a note tacked to the bottom of it.' },
                note : { look : 'Written in an untidy scroll the note reads "Generator blew. Lights out."' },
                grill : {
                    description : 'a small metal grill embedded in the rock face',
                    look : function () { return hideAndDisplayText(this, gameData.map.MineEntrance.interactables.intercom); },
                    hidden : false
                },
                intercom : {
                    description : 'an intercom emitting a low volume static signal',
                    look : 'The static signal follows no recognizable pattern.  This intercom must be working off of a different power source.',
                    hidden : true
                }
            },
            actors : {
                prospector : {
                    description : 'a grizzled old prospector',
                    look : 'The prospector chews on an old corn cob pipe, trying to unblock the mouthpiece.  You can see the dust billowing off of his rags with every jittery move he makes.',
                    talk : function () { return 'The prospector glances up from his pipe.  He flashes a wide toothy smile. "Howdy strangih!  Whachu doin\' round my parts?"\n' +
                                                'You shift uncomfortably as some of his spittle lands on your shirt.' },
                    hidden : false,
                    interactions : {
                        helmet : function () {
                            this.hidden = true;
                            return 'You toss the miner\'s cap with a flick of the wrist.  The prospector is stunned as it rings around atop his head until it comes to rest with a jaunty tilt.\n' 
                            + 'He clicks on the light and takes off at a dead sprint into the mine.  You hear his chattering laughter grow fainter and fainter.';
                        }
                    }
                }
            },
			items : {
				helmet : {
					displayName : 'Miner Helmet',
					description : 'A trusty old miner helmet covered in minor dents. Still seems sturdy and the light works.',
                    use : function (game, subject, target){
                        if (!target) {
                            return useLightSource();
                        }
                        else {
                            var targetObject = helper.returnTargetInCurrentLocation(game, target);
                            helper.removeItemFromObject(game.player.inventory, subject);
                            return targetObject.interactions[subject]();
                        }
                    },
					wearText : 'You pop the trusty old miner helmet onto your head.',
					wear : function(){return equip(this);},
					quantity : 2,
					hidden : true
				},
				shirt : {
					displayName : 'Shirt',
					description : 'A sweet hawaiian shirt',
					wearText : 'You button up your fancy new shirt.  You look like a million bucks.',
					wear : function(){return equip(this);},
					quantity : 1
				}
			},
			exits : {
				inside : {
					displayName : 'Inside',
					destination : 'Tunnel'
				}
			},
		},
		'Tunnel' : {
			firstVisit : true,
			displayName : 'Tunnel',
			description : 'It is dimly lit here and look much darker further back.',
			exits : {
				outside : {
					displayName : 'Outside',
					destination : 'MineEntrance'
				},
				deeper : {
					displayName : 'Deeper',
					destination : 'End'
				}
			}
		},
		'End' : {
			firstVisit : true,
			description : 'placeholder',
			setup : function(){end();}
		}
	}
};

// === Game Actions ===
var gameActions = {
}

// === Necessary Exports ===
module.exports.gameData = gameData;
module.exports.gameActions = gameActions;

// === Helper Functions ===
function end(){
	if(gameData.player.lightSource){
		gameData.map['End'].description = 'You found more gold than you can carry.';
	} else {
		gameData.map['End'].description = 'It is so dark, you can\'t see anything! You fall down an unseen crevice. Your body is never recovered.';
	}
	gameData.gameOver = true;
}

function useLightSource(){
	gameData.player.lightSource = true;
	return 'You click on the light attached to the helmet.'
}

function equip(item){
	item.equiped = true;
	return item.wearText;
}

function hideAndDisplayText(thingToHide, thingToShow) {
    thingToHide.hidden = true;
    thingToShow.hidden = false;
    return 'A light blinks on a small steel grill on the side of the mountain.  You hear the static of a radio signal emitting from it. It\'s an intercom.';
}