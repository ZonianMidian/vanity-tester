export async function getBadges() {
    const getBadges = await fetch(`${window.cors}https://flxrs.com/api/badges`);
    return (await getBadges.json()).filter((b) => !removedBadges.includes(b.type));
}

const removedBadges = ['DankChat Top Supporter'];
