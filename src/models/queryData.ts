import { StoryPoint } from "./poker";

export namespace QueryData {
    export enum Type {
        vote = "vote",
        repeat = "repeat",
        close = "close",
    }

    export type Vote = {
        type: Type.vote;
        payload: StoryPoint;
    };

    export type Restart = {
        type: Type.repeat;
    };

    export type Close = {
        type: Type.close;
    };

    export type Unknown = QueryData.Vote | QueryData.Restart | QueryData.Close;
}

namespace PackedQueryData {
    export enum Type {
        vote,
        repeat,
        close,
    }

    export type Vote = {
        t: Type.vote;
        p: StoryPoint;
    };

    export type Restart = {
        t: Type.repeat;
    };

    export type Close = {
        t: Type.close;
    };

    export type Unknown = Vote | Restart | Close;

    export const fromQueryData = (data: QueryData.Unknown): Unknown => {
        switch (data.type) {
            case QueryData.Type.vote:
                return {
                    t: Type.vote,
                    p: data.payload,
                };

            case QueryData.Type.repeat:
                return { t: Type.repeat };

            case QueryData.Type.close:
                return { t: Type.close };
        }
    };

    export const toQueryData = (data: Unknown): QueryData.Unknown => {
        switch (data.t) {
            case Type.vote:
                return {
                    type: QueryData.Type.vote,
                    payload: data.p,
                };

            case Type.repeat:
                return { type: QueryData.Type.repeat };

            case Type.close:
                return { type: QueryData.Type.close };
        }
    };
}

export const packQueryData = (data: QueryData.Unknown): string => {
    return JSON.stringify(PackedQueryData.fromQueryData(data));
};

export const unpackQueryData = (data: string): QueryData.Unknown => {
    return PackedQueryData.toQueryData(JSON.parse(data));
};
