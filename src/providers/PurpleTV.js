export async function getBadges() {
	const getBadges = await fetch(`${window.cors}https://api.nopbreak.ru/orange/donations`);
	return await getBadges.json();
}

export const fallback = {
	defaultBadgeUrl: 'https://nopbreak.ru/shared/badge.png',
	users: [],
};
