const puppeteer = require('puppeteer');
const Utils = require('./utils.js');

function isOurNonAutomaticMsg(el) {
    if (el.includes('data-tooltip-position="right"')) {
        let words = el.substr(250);
        words = words.substr(words.indexOf("aria-label=\"") + 12);
        words = words.split(' ');
        //check the message is not the automatic one
        if (words[10] == 'disponibili,' && words[5] == 'contattato.') {
            return false;
        } else {
            return true;
        }
    }
    return false;
}

function isTimeDiv(el) {
    if (el.includes('time class')) return true;
    return false;
}

function isClientMsg(el) {
    if (el.includes('data-tooltip-position="right"')) return false;
    return true;
}

async function extractChatInfo(page, chatMsgs) {
    //Scroll up the chat multiple times to make sure it loads all the messages
    let i = 5;
    while (i > 0) {
        await page.evaluate(selector => {
            document.querySelector(selector).scrollBy(0, -10000);
        }, "#u_0_u > div > div > div > table > tbody > tr > td._3q3y._51mw._51m-.vTop > div > div._6skv._4bl9 > div._2evr > div > div:nth-child(1) > div > div > div.uiScrollableAreaWrap.scrollable");
        await Utils.delay(500);
        i--;
    }

    //Fetch chat info
    let text = await page.$eval(Utils.divChild(chatMsgs, 1) + ' time', (element) => {
        return element.innerHTML
    })
    console.log('>>> First message time: ' + text);

    try {
        text = await page.$eval(Utils.divChild(chatMsgs, 2) + ' span', (element) => {
            return element.innerHTML
        })
    } catch (e) {
        //if it throws error usually is because a like emoticon has been sent
        text = '<emoticon>';
    }
    console.log('>>> First message text: ' + text);

    text = await page.$eval("#u_0_u > div > div > div > table > tbody > tr > td._3q3y._51mw._51m-.vTop > div > div._6skv._4bl9 > div._2evs > div > div > div._4bl9 > div > div > div._iyo > div", (element) => {
        return element.innerHTML
    })
    console.log('>>> Client Name: ' + text);
    let isVISmsg = false;
    i = 3;
    //Search for response time. cannot have more than 20 messages without finding the right response
    while (!isVISmsg && i < 20) {
        try {
            let element = await page.$eval(Utils.divChild(chatMsgs, i), (el) => {
                return el.innerHTML
            })
            let found = isOurNonAutomaticMsg(element);
            if (found) {
                isVISmsg = true;
                text = await page.$eval(Utils.divChild(chatMsgs, i) + ' > div > div > div > div', (element) => {
                    return element.getAttribute('data-tooltip-content')
                    // return element.innerHTML
                })
                console.log('>>> Response Time: ' + text);
            }

        } catch (e) {
            console.log(e)
        }
        i++;
    }

    //Calculcate Back and Forth
    let moreMessages = true;
    i = 2;
    let bf = 0;
    let clientSpeaking = false;
    while (moreMessages) {
        try {
            let element = await page.$eval(Utils.divChild(chatMsgs, i), (el) => {
                return el.innerHTML
            })
            if (!isTimeDiv(element)) {
                let clientMsg = isClientMsg(element);
                if (clientMsg && !clientSpeaking) {
                    clientSpeaking = true;
                    bf++;
                } else if (!clientMsg && clientSpeaking) {
                    clientSpeaking = false;
                    bf++;
                }
            }
        } catch (e) {
            moreMessages = false;
            console.log('no more messages (error suppressed)');
        }
        i++;
    }
    console.log('>>> B/F: ' + bf);
}


exports.extractChatInfo = extractChatInfo;