export async function getBadges() {
    const getBadges = await fetch(`${window.cors}https://api.nopbreak.ws/orange/donations`);
    return await getBadges.json();
}
