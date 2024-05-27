import "dotenv/config";

import { Telegraf } from "telegraf";
import { CallbackQuery } from "telegraf/types";
import { handlePingCommand } from "./commands/ping";
import {
    handlePokerCommand,
    handleVoteCallbackQuery,
    handleRestartCallbackQuery,
    handleCloseCallbackQuery,
} from "./commands/poker";
import { logMiddleware } from "./middlewares/logMiddleware";
import {
    CallbackDataType,
    mapStringToCallbackData,
} from "./models/callbackData";

if (!process.env.BOT_TOKEN) {
    throw new Error("Undefined enviroment variable: BOT_TOKEN");
}

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(logMiddleware);

bot.command("ping", handlePingCommand);
bot.command("poker", handlePokerCommand);

bot.on("callback_query", async (context) => {
    await context.telegram.answerCbQuery(context.callbackQuery.id);

    const query = context.callbackQuery as CallbackQuery.DataQuery;
    const callbackData = mapStringToCallbackData(query.data);
    switch (callbackData.type) {
        case CallbackDataType.vote:
            await handleVoteCallbackQuery(context, callbackData);
            break;

        case CallbackDataType.restart:
            await handleRestartCallbackQuery(context);
            break;

        case CallbackDataType.close:
            await handleCloseCallbackQuery(context);
            break;
    }

    await context.answerCbQuery();
});

bot.launch(() => {
    console.log("bot launched:");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
