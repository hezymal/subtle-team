import { MessageDescription } from "../../models/message";

export const buildText = (branchName: string, lastCommit: string) => {
    return `
<strong>subtle-team</strong>

ветка: ${branchName}
последний коммит: ${lastCommit}

команды:
/help - чтобы посмотреть текущее сообщение
/poker <название-задачи> - начать покер голосование
    `.trim();
};

export const buildHelpMessageDescription = (
    branchName: string,
    lastCommit: string
): MessageDescription => {
    return {
        text: buildText(branchName, lastCommit),
    };
};
