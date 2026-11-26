
export async function getBadges() {
    const response = await fetch(`${window.cors}https://api.chatlee.lol/api/chatlee/badges/chatterino`);
    const result = await response.json();

    return result.badges ?? [];
};

export async function getUserBadges(userID) {
    const response = await fetch(
        `${window.cors}https://api.chatlee.lol/api/chatlee/badges/user/${encodeURIComponent(userID)}`
    );

    const result = await response.json();
    if (!Array.isArray(result) || !result.length) {
        return { activeId: null, badges: [] };
    }

    return {
        activeId: result.find(badge => badge.active)?.badge_id ?? null,
        badges: result.map(badge => ({
            id: badge.badge_id,
            image3: badge.image_url,
            tooltip: badge.name
        }))
    }
};