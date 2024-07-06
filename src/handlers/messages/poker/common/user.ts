import { User } from "telegraf/types";

export const getUserName = (user: User): string => {
    const firstName = user.first_name;
    const lastName = user.last_name ?? "";
    const username = user.username ?? "";

    const fullName = lastName ? `${firstName} ${lastName}` : firstName;
    return username ? `${fullName} (${username})` : fullName;
};
