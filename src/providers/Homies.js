export async function getCustomBadges() {
	const response = await fetch(`${window.cors}https://chatterinohomies.com/api/badges/list`);
	const data = await response.json();
	return data.badges.map((badge) => ({
		userId: badge.userId,
		badgeId: badge.image3.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)[0],
	}));
}

export async function getBadges() {
	try {
		const badges = await fetch(`${window.cors}https://itzalex.github.io/badges`);
		const badges2 = await fetch(`${window.cors}https://itzalex.github.io/badges2`);

		if (badges.ok && !badges2.ok) {
			return (await badges.json()).badges;
		} else if (badges2.ok && !badges.ok) {
			return (await badges2.json()).badges;
		} else {
			return mergeData(await badges.json(), await badges2.json());
		}
	} catch (error) {
		return [];
	}
}

function mergeData(badges, badges2) {
	const mergedArray = [...badges.badges];

	badges2.badges.forEach((badges) => {
		const existingObj = mergedArray.find((obj1) => obj1.tooltip === badges.tooltip);

		if (existingObj) {
			if (badges.users[0].length) existingObj.users.push(...badges.users);
		} else {
			mergedArray.push(badges);
		}
	});

	return mergedArray;
}
