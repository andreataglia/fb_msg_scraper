/**
 * @name Fb Msg Scraper
 *
 * @desc Logs into Facebook with credentials. Provide your username and password as environment variables when running the script, i.e:
 * `INSTAGRAM_USER=myuser INSTAGRAM_PWD=mypassword node instagram.js`
 *
 */
const puppeteer = require('puppeteer');

function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time)
    });
}

function divChild(element, child) {
    return element + ' > div:nth-child(' + child + ')';
}

(async () => {
    const CHATS_NUMBER = 10;
    const browser = await puppeteer.launch({
        headless: false
    })
    const page = await browser.newPage()
    await page.goto("https://www.facebook.com/venetoinside/inbox/?mailbox_id=48952121203", {
        waitUntil: 'networkidle2'
    });
    await page.setViewport({
        width: 1200,
        height: 800
    });

    //email
    await page.waitForSelector("[name='email']");
    // await page.click("[name='email']");
    // await page.type("[name='email']", process.env.INSTAGRAM_USER);
    await page.type("[name='email']", "andrea_taglia@hotmail.it");

    //password
    await page.keyboard.down("Tab");
    //uncomment the following if you want the passwor dto be visible
    // page.$eval("._2hvTZ.pexuQ.zyHYP[type='password']", (el) => el.setAttribute("type", "text"));
    // await page.keyboard.type(process.env.INSTAGRAM_PWD);
    await page.keyboard.type("aintsickless");
    await page.keyboard.press("Enter");

    //------------------------------------------ Logged In ------------------------------------------------------
    console.log("I'm logged in");

    let principaleDiv = "#u_0_u > div > div > div > table > tbody > tr > td._10uf._1-9p._51m-.vTop > div > div > div._4u-c > div > div._83e > div._83f._5bpf > div > div > div:nth-child(1) > a > div";
    //trova il selettore ma non ci clicca...
    await page.waitForSelector(principaleDiv);
    console.log("clicking on Pincipale to switch to Archivio... 2 times as i need to screw the notification black screen");
    await page.click(principaleDiv, { delay: 500 });
    await page.click(principaleDiv, { delay: 500 });
    let archivioLink = "#u_0_u > div > div > div > table > tbody > tr > td._10uf._1-9p._51m-.vTop > div > div > div._4u-c > div > div._3xcw > div:nth-child(2)";
    await page.waitForSelector(archivioLink);
    try {
        await page.click(archivioLink);
    } catch (err) {
        console.log('couldn\'t click on archivioLink >>>> ' + err);
    }

    const chatList = "#u_0_u > div > div > div > table > tbody > tr > td._10uf._1-9p._51m-.vTop > div > div > div._29xb > div > div > div > div:nth-child(2) > div";
    await page.waitForSelector(chatList);

    //Open specific chat
    try {
        console.log('clicking on chatList item 2');
        await page.click(divChild(chatList, 6));
    } catch (err) {
        console.log('couldn\'t click on chat list item >>>> ' + err);
    }

    const chatMsgs = "#u_0_u > div > div > div > table > tbody > tr > td._3q3y._51mw._51m-.vTop > div > div._6skv._4bl9 > div._2evr > div > div:nth-child(1) > div > div > div.uiScrollableAreaWrap.scrollable > div > div > div > div > div";
    await page.waitForSelector(chatMsgs);

    //Scroll up the chat multiple times to make sure it loads all the messages
    let i = 5;
    while (i > 0) {
        await page.evaluate(selector => {
            document.querySelector(selector).scrollBy(0, -10000);
        }, "#u_0_u > div > div > div > table > tbody > tr > td._3q3y._51mw._51m-.vTop > div > div._6skv._4bl9 > div._2evr > div > div:nth-child(1) > div > div > div.uiScrollableAreaWrap.scrollable");
        await delay(500);
        i--;
    }
    console.log('scrolled all the way up...')

    //Fetch chat info
    let text = await page.$eval(divChild(chatMsgs, 1) + ' time', (element) => {
        return element.innerHTML
    })
    console.log('>>> First message time: ' + text);

    text = await page.$eval(divChild(chatMsgs, 2) + ' span', (element) => {
        return element.innerHTML
    })
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
            text = await page.$eval(divChild(chatMsgs, i) + ' > div > div > div > div', (element) => {
                return element.getAttribute('data-tooltip-position')
            })
            if (text != null && text == 'right') {
                text = await page.$eval(divChild(chatMsgs, i) + ' span', (element) => {
                    return element.innerHTML
                })
                words = text.split(' ');
                //check the message is not the automatic one
                if (words.length == 34 && words[5] == 'contattato.') {
                    //just keep going
                    isVISmsg = false;
                } else {
                    isVISmsg = true;
                    //fetch time
                    text = await page.$eval(divChild(chatMsgs, i) + ' > div > div > div > div', (element) => {
                        return element.getAttribute('data-tooltip-content')
                    })
                    console.log('>>> Response Time: ' + text);
                }
            }
        } catch (e) {  }
        i++;
    }

    // browser.close()
    console.log('Finished');
})()