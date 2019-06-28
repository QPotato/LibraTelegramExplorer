import { LibraClient, LibraNetwork, AccountState } from 'libra-core'; import * as TelegramBot from 'node-telegram-bot-api';

if (process.env.TELEGRAM === undefined)
    throw new Error('No telegram token in environment');
const telegramtoken = process.env.TELEGRAM;
const bot = new TelegramBot(telegramtoken);

const libraClient = new LibraClient({ network: LibraNetwork.Testnet });
const AddressLength = 64

interface Reaction {
    pattern: (msg: TelegramBot.Message) => boolean;
    action: (msg: TelegramBot.Message) => void;
}

// The bot will try to match the patterns sequentially and execute only the first one that matches.
export const reactions: Reaction[] = [
    {
        pattern: (msg) => msg.text !== undefined && msg.text.trim().length === AddressLength,
        action: (msg) => {
            if (msg.text === undefined)
                throw new Error
            const accountAddress = msg.text.trim();
            libraClient.getAccountState(accountAddress)
                .then((accountState : AccountState) => {
                    // const reply = `*Balance: ${accountState.balance}`
                    const reply = `*Account Details:*\nBalance: ${accountState.balance} Libra\nSequence nº: ${accountState.sequenceNumber}\nSent Event Count: ${accountState.sentEventsCount}\nReceived Event Count ${accountState.receivedEventsCount}`
                    bot.sendMessage(msg.chat.id, reply, {parse_mode: 'Markdown'});
                })
                .catch(() => bot.sendMessage(msg.chat.id, 'Error contacting the Libra network.s'));
        }
    },
    {
        pattern: () => true,
        action: (msg) => bot.sendMessage(msg.chat.id, 'Command not recognized.')
    }
];
