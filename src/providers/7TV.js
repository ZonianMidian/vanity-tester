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

export const subRole = '01F37R3RFR0000K96678WEQT01';

const removedBadges = [
	'01F8H53RZG000FJPFSJJHW714T', //7TV Admin
	'01F8H55JK8000FJPFSJJHW714V', //7TV Dungeon Mistress
	'01F8H56KSR000FJPFSJJHW714W', //7TV Moderator
	'01F915ZNMR000B1B24Q19K3ZHB', //7TV Contributor
	'01FEGX9TZR000E2A0BEAW5DD6M', //7TV Subscriber (Founder)
	'01FNXQY7D00005RKDHEQMRMQN1', //7TV Subscriber (1 Month)
	'01FNXR7R300005RKDHEQMRMQN2', //7TV Subscriber (3 Months)
	'01FNXRJNPG0005RKDHEQMRMQN3', //7TV Subscriber (6 Months)
	'01FNXRX9HG0005RKDHEQMRMQN4', //7TV Subscriber (9 Months)
	'01FNXRZDX00005RKDHEQMRMQN5', //7TV Subscriber (1 Year)
	'01G09ZZ6M000005RZWJQ2XQYEE', //7TV Translator
];
