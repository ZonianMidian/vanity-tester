export async function getBadges() {
    const getBadges = await fetch(`${window.cors}https://api.chatterino.com/badges`);
    return (await getBadges.json()).badges;
}
