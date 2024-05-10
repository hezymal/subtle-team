import { Context, Middleware } from "telegraf";

export const logMiddleware: Middleware<Context> = async (context, next) => {
    const text = `\t${context.from?.username}: ${context.text}`;

    console.time(text);
    await next();
    console.timeEnd(text);
};
