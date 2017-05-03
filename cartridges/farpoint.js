var helper = require('../helper/helper.js');

// === Game Data ===
var gameData = {
    commandCounter : 0,
    gameOver : false,
    introText : 'Captain\'s log.  Stardate 41153.7.\n' +
                '"Our destination is Deneb IV.  Beyond which lies the great unexplored mass of the galaxy."\n',
    outroText : 'Thanks For playing!',
    player : {
        currentLocation : 'Bridge',
        inventory : {},
        lightSource : false
    },
    map : {
        'Engineering' : {
            firstVisit : true,
            displayName : 'Engineering',
            description : 'You enter engineering.  There is a bustle of activity, with a feeling of nervousness hanging in the air.  The rythmic hum of the warp drive stirs a mixture of excitement and ' +
                            'anticipation within your chest.  "My orders are to examine Farpoint.  A starbase built there by the inhabitants of that world."',
            interactables : {
            },
            actors : {
            },
            items : {
            },
            exits : {
                turbolift : {
                    displayName : 'Turbolift',
                    destination : 'Bridge'
                }
            },
        },
        'Bridge' : {
            firstVisit : true,
            displayName : 'Bridge',
            description : '[Bridge]\nYou enter the bridge.  You\'ve never stepped foot on a starship that still had the \'new ship smell\'.\n' +
                        '"My crew is short in several key positions, most notably a first officer, but I am informed that a highly experienced man, one Commander William Riker, will be waiting to join our ship when we reach our Deneb IV destination"',
            interactables : {
                viewscreen: {
                    look : function() {
                        return 'An unusual shining, sparkling grid shape appears stretching across the whole of the galaxy ahead of the ship.  Seeming impossibly large, yet in some ways as delicate ' +
                        'as a spiderweb, it is composed of interlocking geometrical shapes.'
                    },
                    description : 'the viewscreen looms large spanning the front of the bridge.',
                    hidden : true
                }
            },
            actors : {
                troi : {
                    description : 'Troi',
                    look : 'A betazoid member of your crew.  She serves as your ship\'s councilor.',
                    talk : function () {
                        var message = 'Troi has nothing else to say.';;
                        switch (this.talkCounter) {
                            case 0: {
                                message = 'Troi gazes out at the stars displayed on the viewport.  "Farpoint Station. Even the name sounds mysterious."';
                                break;
                            }
                            case 2: {
                                message = '"Captain ... I\' m sensing a...a powerful mind ..."  She is interupted by the sound of the bridge alarm.  The viewscreen flickers on.';
                                gameData.map.Bridge.interactables.viewscreen.hidden = false;
                                break;
                            }
                            default : {
                                break;
                            }
                        }
                        this.talkCounter++;
                        return message;
                    },
                    talkCounter : 0,
                    hidden : false
                },
                data : {
                    description : 'Data',
                    look : 'An android.',
                    talk : function () {
                        var message = 'Data has nothing else to say.';
                        switch (this.talkCounter) {
                            
                            case 0: {
                                message = '"You will agree, Data, that Starfleet\'s instructions are difficult?" you ask.  "Difficult ... how so? Simply solve the mystery of Farpoint Station." he responds in a monotone voice.\n' +
                                        'You smile at Data\'s unassuming response.  "As simple as that."\n\n' +
                                        'You stroll out to the captains chair and inspect the readouts on the armrest.\n' +
                                        '"The problem, Data, is that another life form built that base.  How do I negotiatea friendly agreement for Starfleet to use it while at the same time snoop around finding how and why they built it?"';
                                break;
                            }
                            case 1: {
                                message = 'Data tilts his head at you.  "Inquiry ... the word snoop ... ?"\n' +
                                '"Data, how can you be programmed as a virtual encyclopedia of human information without knowing a simple word like snoop?"\n' +
                                'Data\'s eyes lower as he accesses information before focusing back on you and responding. "Possibility ... a kind of human behavior I was not designed to emulate?"\n' +
								'It is all Troi can do to keep from smiling.';
                                break;
                            }
							case 2: {
                                message = '"It means \'to spy, to sneak\' ..." Data interupts you delightedly "Ah! To seek covertly, to go stealthily, to slink, slither ..."\n' +
								'"Exactly, yes ..." "... to glide, creep, skulk, pussyfoot, gumshoe ..." Data trails off his words, finally becoming aware of the annoyance registering on Picard\'s face.' +
								'Troi cannot keep back the smile now ... then suddenly her face is contorted in pain.';
                                gameData.map.Bridge.actors.troi.talkCounter = 2;
                                break;
							}
                            default : {
                                break;
                            }
                        }
                        this.talkCounter++;
                        return message;
                    },
                    talkCounter : 0,
                    hidden : false
                }
            }
        }
    }
};

// === Game Actions ===
var gameActions = {
}

// === Necessary Exports ===
module.exports.gameData = gameData;
module.exports.gameActions = gameActions;