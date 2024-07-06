import "dotenv/config";

import { Telegraf, TelegramError } from "telegraf";
import { CallbackQuery } from "telegraf/types";

import { handleHelpCommand } from "./handlers/commands/help";
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

bot.command("help", handleHelpCommand);
bot.command("poker", handlePokerCommand);

bot.on("callback_query", async (context) => {
    let isQueryHandled = false;
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

        isQueryHandled = true;
    } catch (error) {
        if (error instanceof TelegramError) {
            isQueryHandled = true;
            console.error(error);
        } else {
            throw error;
        }
    }

    if (isQueryHandled) {
        await context.telegram.answerCbQuery(context.callbackQuery.id);
        await context.answerCbQuery();
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
