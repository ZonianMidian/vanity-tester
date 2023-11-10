export async function getBadges() {
    const getBadges = await fetch(`${window.cors}https://chatterinohomies.com/api/badges/list`);
    return (await getBadges.json()).badges;
}

export async function getRoleBadges() {
    try {
        const badges = await fetch(`${window.cors}https://itzalex.github.io/badges`);
        const badges2 = await fetch(`${window.cors}https://itzalex.github.io/badges2`);

        if (badges.ok || !badges2.ok) {
            return (await badges.json()).badges;
        }

        return mergeData(await badges.json(), await badges2.json());
    } catch (error) {
        return [];
    }
}

function mergeData(badges, badges2) {
    const mergedArray = [...badges.badges];

    badges2.badges.forEach((badges) => {
        const existingObj = mergedArray.find((obj1) => obj1.tooltip === badges.tooltip);

        if (existingObj) {
            if (badges.users[0].length) existingObj.users.push(...badges.users);
        } else {
            mergedArray.push(badges);
        }
    });

    return mergedArray;
}
