import "dotenv/config";

import { Telegraf, TelegramError } from "telegraf";
import { CallbackQuery } from "telegraf/types";
import { handlePingCommand } from "./commands/ping";
import {
    handlePokerCommand,
    handleVoteCallbackQuery,
    handleRestartCallbackQuery,
    handleCloseCallbackQuery,
} from "./commands/poker";
import { logMiddleware } from "./middlewares/logMiddleware";
import { CallbackDataType, unpackCallbackData } from "./models/callbackData";
import { redisService } from "./services/redisService";

if (!process.env.BOT_TOKEN) {
    throw new Error("Undefined enviroment variable: BOT_TOKEN");
}

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(logMiddleware);

bot.command("ping", handlePingCommand);
bot.command("poker", handlePokerCommand);

bot.on("callback_query", async (context) => {
    await context.answerCbQuery();

    try {
        const query = context.callbackQuery as CallbackQuery.DataQuery;
        const callbackData = unpackCallbackData(query.data);
        switch (callbackData.type) {
            case CallbackDataType.vote:
                await handleVoteCallbackQuery(context, callbackData);
                break;

            case CallbackDataType.repeat:
                await handleRestartCallbackQuery(context);
                break;

            case CallbackDataType.close:
                await handleCloseCallbackQuery(context);
                break;
        }
    } catch (error) {
        if (error instanceof TelegramError) {
            console.error(error);
        } else {
            throw error;
        }
    } finally {
        await context.telegram.answerCbQuery(context.callbackQuery.id);
    }
});

bot.launch(() => {
    console.log("bot launched!");
});

process.once("SIGINT", async () => {
    bot.stop("SIGINT");
    await redisService.dispose();
});

process.once("SIGTERM", async () => {
    bot.stop("SIGTERM");
    await redisService.dispose();
});
