import { ExtraEditMessageText } from "telegraf/typings/telegram-types";

export interface MessageDescription {
    text: string;
    extra?: ExtraEditMessageText;
}
