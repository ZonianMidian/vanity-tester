export async function getBadges() {
	const getBadges = await fetch(`${window.cors}https://api.nopbreak.ws/orange/donations`);
	return await getBadges.json();
}

export const fallback = {
	defaultBadgeUrl: 'https://nopbreak.ws/shared/badge.png',
	users: [],
};
