import { Context, NarrowedContext } from "telegraf";
import { CallbackQuery, Update } from "telegraf/types";
import { CommandContextExtn } from "telegraf/typings/telegram-types";

export type CommandHandlerContext = Context<Update.MessageUpdate> &
    CommandContextExtn;

export type CommandCallbackQueryContext = NarrowedContext<
    Context<Update>,
    Update.CallbackQueryUpdate<CallbackQuery>
>;
