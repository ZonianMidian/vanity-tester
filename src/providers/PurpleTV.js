export async function getBadges() {
	const getBadges = await fetch(`${window.cors}https://api.nopbreak.ru/orange/donations`);

	if (!getBadges.ok) {
		throw new Error();
	}

	return await getBadges.json();
}

export const fallback = {
	defaultBadgeUrl: 'https://nopbreak.ru/shared/badge.png',
	users: []
};
