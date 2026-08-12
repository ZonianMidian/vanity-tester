const removedBadges = []; // Add badge IDs here to remove them, e.g. "top_donor"

export async function getBadges() {
    const response = await fetch(`${window.cors}https://api.moltorino.com/badges`);
    const { badges } = await response.json();

    return badges.filter((badge) => !removedBadges.includes(badge.id));
};