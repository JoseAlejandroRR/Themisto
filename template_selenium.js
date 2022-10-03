const {Builder, Browser, By, Keys, util, locateWith,} = require("selenium-webdriver");

const toStop = async (time) => {
    await new Promise(res => setTimeout(res, time))
}

(async () => {
    let driver;
    try {
        driver = await new Builder().forBrowser(Browser.CHROME).build();
        await driver.manage().window().maximize();
        console.log('aqui')
        await toStop(1000);

        await driver.get('https://www.facebook.com');
    }
    catch (error) {
        console.log(error);
        driver.quit();
    }
    driver.quit();
})()