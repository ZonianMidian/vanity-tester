export async function getUserID(userID) {
	try {
		const getStvData = await fetch(`https://7tv.io/v3/users/twitch/${userID}`);

		if (!getStvData.ok) {
			throw new Error();
		}

		const stvData = await getStvData.json();
		return stvData?.user?.id;
	} catch (error) {
		return null;
	}
}

export async function getUserCosmetics(stvID) {
	let retryCount = 0;
	while (retryCount <= 5) {
		const getUserCosmetics = await fetch(`https://7tv.io/v3/gql`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				operationName: 'GetUserCosmetics',
				variables: {
					id: String(stvID),
				},
				query: `
                        query GetUserCosmetics($id: ObjectID!) {
                            user(id: $id) {
                                id
                                cosmetics {
                                    id
                                    kind
                                    selected
                                    __typename
                                }
                                __typename
                            }
                        }
                    `,
			}),
		});

		const userCosmeticsData = await getUserCosmetics.json();

		if (!userCosmeticsData.errors && !userCosmeticsData.message) {
			return userCosmeticsData.data.user.cosmetics;
		} else {
			if (retryCount === 5) {
				return [];
			}

			await new Promise((r) => setTimeout(r, 500));
			retryCount++;
		}
	}
}

export async function getCosmetics() {
	let retryCount = 0;

	while (retryCount < 5) {
		const getCosmetics = await fetch(`https://7tv.io/v3/gql`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				operationName: 'GetCosmestics',
				variables: {},
				query: `
                    query GetCosmestics($list: [ObjectID!]) {
                        cosmetics(list: $list) {
                            paints {
                                id
                                kind
                                name
                                function
                                color
                                angle
                                shape
                                image_url
                                repeat
                                stops {
                                    at
                                    color
                                    __typename
                                }
                                shadows {
                                    x_offset
                                    y_offset
                                    radius
                                    color
                                    __typename
                                }
                                __typename
                            }
                            badges {
                                id
                                kind
                                name
                                tooltip
                                tag
                                __typename
                            }
                            __typename
                        }
                    }
                `,
			}),
		});

		const cosmeticsData = await getCosmetics.json();

		if (!cosmeticsData.errors && !cosmeticsData.message) {
			const cosmetics = cosmeticsData.data.cosmetics;
			cosmetics.badges = cosmetics.badges.filter((b) => !removedBadges.includes(b.id));
			return cosmetics;
		} else {
			if (retryCount === 5) {
				return [];
			}

			await new Promise((r) => setTimeout(r, 500));
			retryCount++;
		}
	}

	return [];
}

export async function getUserData(userID) {
	const stvID = await getUserID(userID);
	if (!stvID) return null;

	return await getUserCosmetics(stvID);
}

export const subRole = '6076a86b09a4c63a38ebe801';

const removedBadges = [
	'60cd64d6f959f994a3c3849a', //7TV Admin
	'60cd6511f959f994a3c3849b', //7TV Dungeon Mistress
	'60cd6533f959f994a3c3849c', //7TV Moderator
	'60d5998fb0ac44b85331fe2b', //7TV Contributor
	'612f92abe1280b72b856b4d4', //7TV Subscriber (Founder)
	'61a8d4c45c4db175e98a5ea1', //7TV Subscriber (1 Month)
	'61a8d5fc5c4db175e98a5ea2', //7TV Subscriber (3 Months)
	'61a8d7625c4db175e98a5ea3', //7TV Subscriber (6 Months)
	'61a8d8be5c4db175e98a5ea4', //7TV Subscriber (9 Months)
	'61a8d9045c4db175e98a5ea5', //7TV Subscriber (1 Year)
	'6252f19002e3fc95c5dbf9ce', //7TV Translator
	'62f99d0ce46eb00e438a6983', //7TV Translator
];
