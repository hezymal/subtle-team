import { StoryPoint } from "./poker";

export enum CallbackDataType {
    vote = "vote",
    restart = "restart",
    close = "close",
}

enum ShortCallbackDataType {
    vote = "v",
    restart = "r",
    close = "c",
}

export type VoteCallbackData = {
    type: CallbackDataType.vote;
    payload: StoryPoint;
};

export type RestartCallbackData = {
    type: CallbackDataType.restart;
};

export type CloseCallbackData = {
    type: CallbackDataType.close;
};

export type CallbackData =
    | VoteCallbackData
    | RestartCallbackData
    | CloseCallbackData;

type ShortVoteCallbackData = {
    t: ShortCallbackDataType.vote;
    p: StoryPoint;
};

type ShortRestartCallbackData = {
    t: ShortCallbackDataType.restart;
};

type ShortCloseCallbackData = {
    t: ShortCallbackDataType.close;
};

type ShortCallbackData =
    | ShortVoteCallbackData
    | ShortRestartCallbackData
    | ShortCloseCallbackData;

const mapCallbackDataToShort = (data: CallbackData): ShortCallbackData => {
    switch (data.type) {
        case CallbackDataType.vote:
            return {
                t: ShortCallbackDataType.vote,
                p: data.payload,
            };

        case CallbackDataType.restart:
            return {
                t: ShortCallbackDataType.restart,
            };

        case CallbackDataType.close:
            return {
                t: ShortCallbackDataType.close,
            };
    }
};

const mapShortToCallbackData = (data: ShortCallbackData): CallbackData => {
    switch (data.t) {
        case ShortCallbackDataType.vote:
            return { type: CallbackDataType.vote, payload: data.p };

        case ShortCallbackDataType.restart:
            return { type: CallbackDataType.restart };

        case ShortCallbackDataType.close:
            return { type: CallbackDataType.close };
    }
};

export const mapCallbackDataToString = (data: CallbackData): string => {
    const shortCallbackData = mapCallbackDataToShort(data);
    return JSON.stringify(shortCallbackData);
};

export const mapStringToCallbackData = (str: string): CallbackData => {
    const data = JSON.parse(str);
    return mapShortToCallbackData(data);
};
