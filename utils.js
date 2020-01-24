//Conf Vars
const CHATS_TO_SCRAPE = 2;
const CHATS_TO_SKIP = 5;
const CHATS_IN_PRINCIPLE = 5;

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
exports.CHATS_TO_SCRAPE = CHATS_TO_SCRAPE;
exports.CHATS_TO_SKIP = CHATS_TO_SKIP;
exports.CHATS_IN_PRINCIPLE = CHATS_IN_PRINCIPLE;