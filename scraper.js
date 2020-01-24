/**
 * @name Fb Msg Scraper
 *
 * @desc Logs into Facebook with credentials. Provide your username and password as environment variables when running the script, i.e:
 * `INSTAGRAM_USER=myuser INSTAGRAM_PWD=mypassword node instagram.js`
 *
 */
const puppeteer = require('puppeteer');
const Chat = require('./chat.js');
const Utils = require('./utils.js');

//Core
(async () => {
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

    const principaleDiv = "#u_0_u > div > div > div > table > tbody > tr > td._10uf._1-9p._51m-.vTop > div > div > div._4u-c > div > div._83e > div._83f._5bpf > div > div > div:nth-child(1) > a > div";
    await page.waitForSelector(principaleDiv);
    console.log("clicking on Pincipale to switch to Archivio... 2 times as i need to screw the notification black screen");
    await page.click(principaleDiv, {
        delay: 500
    });
    await page.click(principaleDiv, {
        delay: 500
    });
    const archivioLink = "#u_0_u > div > div > div > table > tbody > tr > td._10uf._1-9p._51m-.vTop > div > div > div._4u-c > div > div._3xcw > div:nth-child(2)";
    await page.waitForSelector(archivioLink);
    try {
        await page.click(archivioLink);
    } catch (err) {
        console.log('couldn\'t click on archivioLink >>>> ' + err);
    }

    const chatList = "#u_0_u > div > div > div > table > tbody > tr > td._10uf._1-9p._51m-.vTop > div > div > div._29xb > div > div > div > div:nth-child(2) > div";
    await page.waitForSelector(chatList);

    //Cycle thorugh the chats. i = initial chat offset.
    let i = 0;
    const chatMsgs = "#u_0_u > div > div > div > table > tbody > tr > td._3q3y._51mw._51m-.vTop > div > div._6skv._4bl9 > div._2evr > div > div:nth-child(1) > div > div > div.uiScrollableAreaWrap.scrollable > div > div > div > div > div";
    const spostaInPrincipale = "#u_0_u > div > div > div > table > tbody > tr > td._3q3y._51mw._51m-.vTop > div > div._6skv._4bl9 > div._2evs > div > div > div:nth-child(3) > div > div._suc._stx._5bpf";
    while (i < Utils.CHATS_TO_SCRAPE) {
        //Open specific chat
        try {
            await page.hover(Utils.divChild(chatList, Utils.CHATS_TO_SKIP));
            await page.click(Utils.divChild(chatList, Utils.CHATS_TO_SKIP), {
                delay: 200
            });
        } catch (err) {
            console.log('couldn\'t click on chat list item >>>> ' + err);
        }
        await page.waitForSelector(chatMsgs);
        await page.waitForSelector(spostaInPrincipale);
        console.log('Chat ' + i + ' ------------------------------->')
        await Chat.extractChatInfo(page, chatMsgs);
        //put chat into Principale once scraped
        await page.click(spostaInPrincipale, {
            delay: 200
        })
        i++;
    }

    //once finished scraping put the conversations back into Archive
    console.log('Finishced scraping. Putting chats back in Archive...');
    await page.click(principaleDiv, {
        delay: 500
    });
    let principaleLink = "#u_0_u > div > div > div > table > tbody > tr > td._10uf._1-9p._51m-.vTop > div > div > div._4u-c > div > div._3xcw > div:nth-child(1)";
    await page.click(principaleLink, {
        delay: 500
    });
    await page.waitForSelector(chatMsgs);
    let moreChats = true;
    const spostaInArchivio = "#u_0_u > div > div > div > table > tbody > tr > td._3q3y._51mw._51m-.vTop > div > div._6skv._4bl9 > div._2evs > div > div > div:nth-child(3) > div > div._suc._su6._5bpf > div > div > div";
    while (moreChats) {
        //Open specific chat
        try {
            await page.hover(Utils.divChild(chatList, Utils.CHATS_IN_PRINCIPLE));
            await page.click(Utils.divChild(chatList, Utils.CHATS_IN_PRINCIPLE), {
                delay: 200
            });
            await page.waitForSelector(chatMsgs);
            await page.waitForSelector(spostaInArchivio);
            await page.click(spostaInArchivio, {
                delay: 200
            })
        } catch (err) {
            console.log('couldn\'t click on chat, it is over. (error suppressed)' + err);
            moreChats = false;
        }
    }

    // browser.close()
    console.log('Finished');
})()