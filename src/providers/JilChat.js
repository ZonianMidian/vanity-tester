export async function getBadges() {
    const response = await fetch(`${window.cors}https://api.jil.chat/v1/badges`);
    return (await response.json());
};