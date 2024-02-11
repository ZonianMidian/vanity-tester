export async function getBadges() {
	const getBadges = await fetch(`${window.cors}https://api.betterttv.net/3/cached/badges/twitch`);
	return await getBadges.json();
}
