var aOrAn = function (c) {
    if (['a', 'e', 'i', 'o'].indexOf(c.toLowerCase()) !== -1) {
        return 'an ';
    }
    else {
        return 'a ';
    }
}

var getItem = function (itemLocation, itemName) {
    return itemLocation[getItemName(itemLocation, itemName)];
}

var getItemName = function (itemLocation, itemName) {
    if (itemLocation[itemName] !== undefined) {
        return itemName;
    } else {
        for (var item in itemLocation) {
            if (itemLocation[item].displayName.toLowerCase() === itemName) {
                return item;
            }
        }
    }
}

var checkForGameEnd = function (game, returnString, actions) {
    if (game.gameOver) {
        returnString = returnString + '\n' + game.outroText;
        actions.die(game, { action: 'die' });
    }
    return returnString;
}

var moveItem = function (itemName, startLocation, endLocation) {
    var itemName = getItemName(startLocation, itemName);
    var itemAtOrigin = getItem(startLocation, itemName);
    if (itemAtOrigin === undefined) {
        throw 'itemDoesNotExist';
    }
    var itemAtDestination = getItem(endLocation, itemName);
    if (itemAtDestination === undefined) {
        endLocation[itemName] = clone(itemAtOrigin);
        endLocation[itemName].quantity = 1;
    } else {
        ++endLocation[itemName].quantity;
    }
    if (itemAtOrigin.hasOwnProperty('quantity')) {
        --itemAtOrigin.quantity;
        if (itemAtOrigin.quantity === 0) {
            delete startLocation[itemName];
        }
    }
}

var clone = function (obj) {
    if (obj == null || typeof (obj) != 'object') {
        return obj;
    }
    var temp = obj.constructor();
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            temp[key] = clone(obj[key]);
        }
    }
    return temp;
}

module.exports = {
    aOrAn: aOrAn,    
    getItem: getItem,	
    getItemName: getItemName,
    checkForGameEnd: checkForGameEnd,
    moveItem: moveItem,
    clone: clone
}