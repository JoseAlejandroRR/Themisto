const {Builder, Browser, By, Keys, util, locateWith,} = require("selenium-webdriver");

const toStop = async (time) => {
    await new Promise(res => setTimeout(res, time))
}

const fs = require('fs');

let prueba = async () => {
    let driver;
    try {
        driver = await new Builder().forBrowser(Browser.CHROME).build();
        await driver.manage().window().maximize();
        
        await toStop(1000);

        await driver.get('https://www.facebook.com');

        let boxemail = await driver.findElement(By.id('email'));
        await boxemail.sendKeys('Johbrylinkpark@hotmail.com');

        let boxpassword = await driver.findElement(By.id('pass'));
        await boxpassword.sendKeys('melladojohbry1216');

        let bottom = await driver.findElement(By.css('.selected._51sy'));
        await bottom.click();

        await toStop(2000);

        await driver.takeScreenshot().then(
            function(image){
                require('fs').writeFileSync('captured_image_2.png', image, 'base64');
            })

        driver.quit();
    }
    catch (error) {
        console.log(error);
        driver.quit();
    }
}

prueba();
