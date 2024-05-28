import { execFileSync } from "child_process";

import { CommandHandlerContext } from "../types";

const execGit = (...commands: string[]): string => {
    const tag = execFileSync("git", commands);
    return tag.toString().trim();
};

export const handlePingCommand = (context: CommandHandlerContext) => {
    const tags = execGit("tag");
    const tagList = tags.split("\n");
    const branch = execGit("branch");
    const messageText = `<strong>понг</strong>
        тег: ${tagList.length > 0 ? tagList[0] : "-"}
        ветка: ${branch}
    `;

    return context.telegram.sendMessage(context.message.chat.id, messageText, {
        parse_mode: "HTML",
    });
};
