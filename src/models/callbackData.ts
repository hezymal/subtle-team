import { StoryPoint } from "./poker";

export enum CallbackDataType {
    vote = "vote",
    repeat = "repeat",
    close = "close",
}

enum ShortCallbackDataType {
    vote = "v",
    repeat = "r",
    close = "c",
}

export type VoteCallbackData = {
    type: CallbackDataType.vote;
    payload: StoryPoint;
};

export type RestartCallbackData = {
    type: CallbackDataType.repeat;
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
    t: ShortCallbackDataType.repeat;
};

type ShortCloseCallbackData = {
    t: ShortCallbackDataType.close;
};

type ShortCallbackData =
    | ShortVoteCallbackData
    | ShortRestartCallbackData
    | ShortCloseCallbackData;

const mapCallbackDataToShort = (
    callbackData: CallbackData
): ShortCallbackData => {
    switch (callbackData.type) {
        case CallbackDataType.vote:
            return { t: ShortCallbackDataType.vote, p: callbackData.payload };

        case CallbackDataType.repeat:
            return { t: ShortCallbackDataType.repeat };

        case CallbackDataType.close:
            return { t: ShortCallbackDataType.close };
    }
};

const mapShortToCallbackData = (
    shortCallbackData: ShortCallbackData
): CallbackData => {
    switch (shortCallbackData.t) {
        case ShortCallbackDataType.vote:
            return {
                type: CallbackDataType.vote,
                payload: shortCallbackData.p,
            };

        case ShortCallbackDataType.repeat:
            return { type: CallbackDataType.repeat };

        case ShortCallbackDataType.close:
            return { type: CallbackDataType.close };
    }
};

export const packCallbackData = (callbackData: CallbackData): string => {
    const shortCallbackData = mapCallbackDataToShort(callbackData);
    return JSON.stringify(shortCallbackData);
};

export const unpackCallbackData = (
    packedCallbackData: string
): CallbackData => {
    const callbackData = JSON.parse(packedCallbackData);
    return mapShortToCallbackData(callbackData);
};
