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

function toDateTime(str) {
    let obj = {
        date: '??',
        time: '??'
    }
    if (str.split(',').length > 1) {
        //like: 14 GEN 2020, 22:30
        let date = str.split(',')[0]
        let dateMM = '';
        switch (date.substr(3, 3).toLowerCase()) {
            case 'gen':
                dateMM = '01';
                break;
            case 'feb':
                dateMM = '02';
                break;
            case 'mar':
                dateMM = '03';
                break;
        }
        obj.date = dateMM + '/' + date.substr(0, 2) + '/' + date.substr(7, 4);
        obj.time = str.split(',')[1].trim();
    } else {
        //like: gio 09:37 or Giovedì 10:17
        let date = str.split(' ')[0].substr(0, 3).toLowerCase()
        let now = new Date();
        let weekDay;
        switch (date) {
            case 'dom':
                weekDay = 0;
                break;
            case 'lun':
                weekDay = 1;
                break;
            case 'mar':
                weekDay = 2;
                break;
            case 'mer':
                weekDay = 3;
                break;
            case 'gio':
                weekDay = 4;
                break;
            case 'ven':
                weekDay = 5;
                break;
            case 'sab':
                weekDay = 6;
                break;
        }

        if (now.getDay() > weekDay) {
            weekDay = now.getDay() - weekDay;
        } else {
            weekDay = 7 - (weekDay - now.getDay());
        }
        now = new Date(Date.now() - weekDay * 86400000);
        obj.date = ("0" + (now.getMonth() + 1)).slice(-2) + '/' + ("0" + (now.getDate())).slice(-2) + '/' + now.getFullYear();
        obj.time = str.split(' ')[1]
    }
    return obj;
}

exports.delay = delay;
exports.divChild = divChild;
exports.toDateTime = toDateTime;
exports.CHATS_TO_SCRAPE = CHATS_TO_SCRAPE;
exports.CHATS_TO_SKIP = CHATS_TO_SKIP;
exports.CHATS_IN_PRINCIPLE = CHATS_IN_PRINCIPLE;