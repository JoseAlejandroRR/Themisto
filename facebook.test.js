const {Builder, Browser, By, Keys, util, locateWith,} = require("selenium-webdriver");

const toStop = async (time) => {
    await new Promise(res => setTimeout(res, time))
}

const fs = require('fs');


describe('Login', () => {
    let driver;
    const openPage = (url) => {
        return driver.get(url);
    }
    const form = async (email, password) => {
        if (email) {
            let boxemail = await driver.findElement(By.id('email'));
            await boxemail.sendKeys(email);
        }
        if (password) {
            let boxpassword = await driver.findElement(By.id('pass'));
            await boxpassword.sendKeys(password);
        }

    }
    beforeAll (async () => {
        driver = await new Builder().forBrowser(Browser.CHROME).build();
        await toStop(2000);
    })
    beforeEach(async () => {
        await toStop(1000);
    })
    afterAll (async () => {
        await toStop(2000);
        await driver.quit();
    })

    test('Invalid User', async () => {
        await driver.manage().window().maximize();
        await openPage ('https://www.facebook.com');

        await form('johbrym@mail.com', '123456');

        let bottom = await driver.findElement(By.css('.selected._51sy'));
        await bottom.click();
        await toStop(1000);

        const pageError = await driver.findElement(By.css('._9axz')).getText();
        expect(pageError).toBe('Log Into Facebook');

        await driver.takeScreenshot().then(
            function(image) {
                require('fs').writeFileSync('captured_image_1.png', image, 'base64');
            })
            await toStop(1000);    
    }, 5000)
}, 20000)

