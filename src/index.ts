import "dotenv/config";

import { Telegraf, TelegramError } from "telegraf";
import { CallbackQuery } from "telegraf/types";

import { handlePingCommand } from "./handlers/commands/ping";
import { handlePokerCommand } from "./handlers/commands/poker";
import {
    handleVoteQuery,
    handleRestartQuery,
    handleCloseQuery,
} from "./handlers/queries/poker";
import { logMiddleware } from "./middlewares/logMiddleware";
import { QueryData, unpackQueryData } from "./models/queryData";
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
        const data = unpackQueryData(query.data);
        switch (data.type) {
            case QueryData.Type.vote:
                await handleVoteQuery(context, data);
                break;

            case QueryData.Type.repeat:
                await handleRestartQuery(context);
                break;

            case QueryData.Type.close:
                await handleCloseQuery(context);
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
