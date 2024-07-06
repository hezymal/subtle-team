import { MessageDescription } from "../../models/message";

export const buildText = (branchName: string, lastCommit: string) => {
    return `
<strong>Доступные команды:</strong>
/help - текущее сообщение
/poker task-name - начать голосование

текущая версия: ${branchName} / ${lastCommit}
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
