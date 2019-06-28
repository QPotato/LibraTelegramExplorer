import * as TelegramBot from 'node-telegram-bot-api';
import { reactions } from './explorer'

const init = async () => {
    // Create the telegram bot
    if (process.env.TELEGRAM === undefined)
        throw new Error('No telegram token in environment');
    const telegramtoken = process.env.TELEGRAM;
    var bot: TelegramBot;
    if (process.env.WEBHOOK && process.env.PORT) {
        console.log("Starting in webhook mode.");
        const url = process.env.WEBHOOK;
        const port = parseInt(process.env.PORT);
        const options = {
            webHook: {
                // Port to which you should bind is assigned to $PORT variable
                // See: https://devcenter.heroku.com/articles/dynos#local-environment-variables
                port: port
                // you do NOT need to set up certificates since Heroku provides
                // the SSL certs already (https://<app-name>.herokuapp.com)
                // Also no need to pass IP because on Heroku you need to bind to 0.0.0.0
            }
        };
        bot = new TelegramBot(telegramtoken, options);
        const webhook = `${url}/bot${telegramtoken}`
        console.log(webhook);
        bot.setWebHook(webhook);
    }
    else {
        console.log("Starting in lonpolling mode");
        bot = new TelegramBot(telegramtoken, { polling: true })
    }
    bot.on('message', (msg) => {
        // React to a message with the first that matches the pattern.
        for (const reaction of reactions) {
            if (reaction.pattern(msg)) {
                reaction.action(msg);
                break;
            }
        }
    });
}

init()
