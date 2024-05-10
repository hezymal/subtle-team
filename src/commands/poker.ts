import { TelegramError } from "telegraf";
import { CallbackQuery, InlineKeyboardMarkup } from "telegraf/types";
import {
    PokerState,
    PokerUserVote,
    getStoryPointLabel,
    pokerService,
} from "../services/pokerService";
import { StoryPoint } from "../models/poker";
import { CommandCallbackQueryContext, CommandHandlerContext } from "../types";

const RESTART_BUTTON_ID = "RESTART_BUTTON";
const CLOSE_BUTTON_ID = "STOP_BUTTON";

const buildInlineKeyboardMarkup = (): InlineKeyboardMarkup => {
    const storyPoints = Object.values(StoryPoint);
    const half = Math.ceil(storyPoints.length / 2);

    return {
        inline_keyboard: [
            storyPoints.slice(0, half).map((storyPoint) => ({
                text: getStoryPointLabel(storyPoint),
                callback_data: storyPoint,
            })),
            storyPoints.slice(half).map((storyPoint) => ({
                text: getStoryPointLabel(storyPoint),
                callback_data: storyPoint,
            })),
            [
                {
                    text: "Перезапустить",
                    callback_data: RESTART_BUTTON_ID,
                },
                {
                    text: "Завершить",
                    callback_data: CLOSE_BUTTON_ID,
                },
            ],
        ],
    };
};

export const pokerCommandHandler = async (context: CommandHandlerContext) => {
    const chatId = context.message.chat.id;
    const pokerName = context.args[0] || "";
    const messageText = pokerService.getPokerTitle(pokerName);
    const message = await context.telegram.sendMessage(chatId, messageText, {
        parse_mode: "HTML",
        reply_markup: buildInlineKeyboardMarkup(),
    });

    const messageId = message.message_id;
    await pokerService.open(chatId, messageId, pokerName);
};

export const pokerCommandCallbackQuery = async (
    context: CommandCallbackQueryContext
) => {
    if (!context.chat || !context.msgId) {
        return;
    }

    const query = context.callbackQuery as CallbackQuery.DataQuery;
    const chatId = context.chat.id;
    const messageId = context.msgId;

    if (query.data === CLOSE_BUTTON_ID) {
        await pokerService.close(chatId, messageId);
    } else if (query.data === RESTART_BUTTON_ID) {
        await pokerService.restart(chatId, messageId);
    } else {
        const storyPoint = query.data as StoryPoint;
        const userVote: PokerUserVote = { user: context.from, storyPoint };
        await pokerService.setUserVote(chatId, messageId, userVote);
    }

    const pokerState = await pokerService.getPokerState(chatId, messageId);
    try {
        if (pokerState === PokerState.opened) {
            const messageText = await pokerService.getOpenedPokerText(
                chatId,
                messageId
            );
            await context.editMessageText(messageText, {
                parse_mode: "HTML",
                reply_markup: buildInlineKeyboardMarkup(),
            });
        } else {
            const messageText = await pokerService.getClosedPokerText(
                chatId,
                messageId
            );
            await context.editMessageText(messageText, {
                parse_mode: "HTML",
            });
        }
    } catch (error) {
        if (error instanceof TelegramError) {
            console.warn(error);
        } else {
            throw error;
        }
    }
};
