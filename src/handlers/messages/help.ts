import { MessageDescription } from "../../models/message";

export const buildText = (branchName: string, lastCommit: string) => {
    return `
<strong>subtle-team</strong>

версия: ${branchName} / ${lastCommit}

доступные команды:
/help - текущее сообщение
/poker task-name - начать голосование
    `.trim();
};

export const buildHelpMessageDescription = (
    branchName: string,
    lastCommit: string
): MessageDescription => {
    return {
        text: buildText(branchName, lastCommit),
        extra: {
            parse_mode: "HTML",
        },
    };
};
