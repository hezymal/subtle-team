import { MessageDescription } from "../../models/message";

export const buildText = (branchName: string, lastCommit: string) => {
    return `
<strong>Помощь</strong>

<strong>версия:</strong> ${branchName} / ${lastCommit}

<strong>доступные команды:</strong>
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
