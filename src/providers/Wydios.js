export async function getBadges() {
    const response = await fetch(`${window.cors}https://api.wydios.de/badges`);
    const result = await response.json();

    return result.data?.badges ?? [];
};

export async function getUserBadges(userID) {
    const response = await fetch(
        `${window.cors}https://api.wydios.de/user/get/badges?platform=twitch&platform_id=${encodeURIComponent(userID)}`
    );

    const result = await response.json();
    if (result.error || !result.data?.badges?.length) {
        return { activeId: null, badges: [] };
    };

    return {
        activeId: result.data?.activeBadgeId ?? null,
        badges: result.data?.badges ?? []
    };
};