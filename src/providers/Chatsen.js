export async function getBadges() {
	const getBadges = await fetch(
		`${window.cors}https://raw.githubusercontent.com/chatsen/resources/master/assets/data.json`,
	);
	const badges = await getBadges.json();

	const patreons = await getPatreons();
	for (const tier of patreons) {
		const badgeName = tiers[tier.name];
		const users = tier.users;
		for (const user of users) {
			const userData = badges.users.filter((u) => u.id === user)[0];
			if (userData) {
				const userBadge = userData.badges.filter((b) => b.badgeName == badgeName)[0];
				if (!userBadge) {
					userData.badges.push({
						badgeName,
					});
				}
			} else {
				badges.users.push({
					id: user,
					badges: [
						{
							badgeName,
						},
					],
				});
			}
		}
	}

	return badges;
}

async function getPatreons() {
	const getPatreons = await fetch(`${window.cors}https://api.chatsen.app/account/badges`);
	return await getPatreons.json();
}

export const relaxo = ['early_bird', 'relaxo'];
export const patreon = [
	'patreon_tier1s',
	'patreon_tier1',
	'patreon_tier2s',
	'patreon_tier2',
	'patreon_tier3s',
	'patreon_tier3',
	'patreon_tier4',
];

export const fallback = {
	badges: [],
	users: [],
};

const tiers = {
	'Chatsen Patreon: Tier 1': 'patreon_tier1',
	'Chatsen Patreon: Tier 2': 'patreon_tier2',
	'Chatsen Patreon: Tier 3': 'patreon_tier3',
};
