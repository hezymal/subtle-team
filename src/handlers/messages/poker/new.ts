import { InlineKeyboardMarkup } from "telegraf/types";
import { QueryData, packQueryData } from "../../../models/queryData";
import { MessageDescription } from "../../../models/message";
import { StoryPoint, getStoryPointLabel } from "../../../models/poker";
import { getPokerTitle } from "./title";

const getKeyboardMarkup = (): InlineKeyboardMarkup => {
    const storyPoints = Object.values(StoryPoint);
    const amountInRow = Math.ceil(storyPoints.length / 2);

    return {
        inline_keyboard: [
            storyPoints.slice(0, amountInRow).map((storyPoint) => ({
                text: getStoryPointLabel(storyPoint),
                callback_data: packQueryData({
                    type: QueryData.Type.vote,
                    payload: storyPoint,
                }),
            })),
            storyPoints.slice(amountInRow).map((storyPoint) => ({
                text: getStoryPointLabel(storyPoint),
                callback_data: packQueryData({
                    type: QueryData.Type.vote,
                    payload: storyPoint,
                }),
            })),
            [
                {
                    text: "Завершить",
                    callback_data: packQueryData({
                        type: QueryData.Type.close,
                    }),
                },
            ],
        ],
    };
};

export const buildNewMessageDescription = (
    pokerName: string
): MessageDescription => {
    return {
        text: getPokerTitle(pokerName),
        extra: {
            parse_mode: "HTML",
            reply_markup: getKeyboardMarkup(),
        },
    };
};
