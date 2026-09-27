const removedBadges = []; // Add badge IDs here to remove them, e.g. "top_donor"

export async function getBadges() {
    const response = await fetch(`${window.cors}https://api.moltorino.com/v2/badges`);
    const { badges = [], users = {} } = (await response.json()) ?? {};

    return {
        badges: badges.filter(
            (badge) => !removedBadges.includes(badge.id)
        ),

        users: Object.fromEntries(Object.entries(users)
            .map(([userId, user]) => [
                userId,
                {
                    ...user,
                    badges: (user.badges ?? []).filter((badgeId) => !removedBadges.includes(badgeId))
                }
            ])
            .filter(([, user]) => user.badges.length > 0)
        )
    };
};