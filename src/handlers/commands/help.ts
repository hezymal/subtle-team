import { buildHelpMessageDescription } from "../messages/help";
import { CommandHandlerContext } from "../../types";

export const handleHelpCommand = (context: CommandHandlerContext) => {
    const branchName = process.env.BRANCH_NAME || "не задано";
    const lastCommit = process.env.LAST_COMMIT || "не задано";

    const messageDescription = buildHelpMessageDescription(
        branchName,
        lastCommit
    );

    return context.sendMessage(
        messageDescription.text,
        messageDescription.extra
    );
};
