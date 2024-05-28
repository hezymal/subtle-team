import { execFileSync } from "child_process";

import { CommandHandlerContext } from "../types";

const execGit = (...commands: string[]): string => {
    const tag = execFileSync("git", commands);
    return tag.toString().trim();
};

export const handlePingCommand = (context: CommandHandlerContext) => {
    const tag = execGit("tag");
    const branch = execGit("branch");
    const messageText = `<strong>pong</strong>
        tag: ${tag}
        branch: ${branch}
    `;

    return context.telegram.sendMessage(context.message.chat.id, messageText, {
        parse_mode: "HTML",
    });
};
