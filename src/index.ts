import "dotenv/config";

import { Telegraf } from "telegraf";
import { pingCommandHandler } from "./commands/ping";
import {
    pokerCommandCallbackQuery,
    pokerCommandHandler,
} from "./commands/poker";
import { logMiddleware } from "./middlewares/logMiddleware";

if (!process.env.BOT_TOKEN) {
    throw new Error("Undefined enviroment variable: BOT_TOKEN");
}

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(logMiddleware);

bot.command("ping", pingCommandHandler);
bot.command("poker", pokerCommandHandler);

bot.on("callback_query", async (context) => {
    await context.telegram.answerCbQuery(context.callbackQuery.id);
    await pokerCommandCallbackQuery(context);
    await context.answerCbQuery();
});

bot.launch(() => {
    console.log("bot launched:");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
