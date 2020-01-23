//Conf Vars
const CHATS_NUMBER = 10;

//Utils Functions
function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

function divChild(element, child) {
    return element + ' > div:nth-child(' + child + ')';
}

exports.delay = delay;
exports.divChild = divChild;