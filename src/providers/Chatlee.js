
export async function getBadges() {
    const response = await fetch(`${window.cors}https://api.chatlee.lol/api/chatlee/badges/chatterino`);
    const result = await response.json();

    return result.badges ?? [];
};

export async function getUserBadges(userID) {
    const response = await fetch(
        `${window.cors}https://api.chatlee.lol/api/chatlee/badges/chatterino?user_ids=${encodeURIComponent(userID)}`
    );

    const result = await response.json();
    if (!result.badges?.length) {
        return { activeId: null, badges: [] };
    };

    return {
        activeId: result.equipped?.[userID] ?? null,
        badges: result.badges
    };
};