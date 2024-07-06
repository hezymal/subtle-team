import { buildHelpMessageDescription } from "../messages/help";
import { CommandHandlerContext } from "../../types";

export const handleHelpCommand = (context: CommandHandlerContext) => {
    const branchName = process.env.BRANCH_NAME || "<не указано>";
    const lastCommit = process.env.LAST_COMMIT || "<не указано>";

    const messageDescription = buildHelpMessageDescription(
        branchName,
        lastCommit
    );
    return context.telegram.sendMessage(
        context.message.chat.id,
        messageDescription.text
    );
};
