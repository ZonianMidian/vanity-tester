export async function getUserData(userName) {
	try {
		const userData = await fetch(`https://api.ivr.fi/v2/twitch/user?login=${userName}`);

		if (!userData.ok) {
			throw new Error();
		}

		return await userData.json();
	} catch (error) {
		return null;
	}
}

export async function getChannelData(userName) {
	try {
		const channelData = await fetch(`https://api.ivr.fi/v2/twitch/badges/channel?login=${userName}`);

		if (!channelData.ok) {
			throw new Error();
		}

		const badges = await channelData.json();

		return Object.entries(badges).map(([_, data]) => ({
			set_id: data.set_id,
			versions: data.versions.map((version) => ({
				id: version.id,
				image_url_4x: version.image_url_4x,
				title: version.title
			}))
		}));
	} catch (error) {
		return [];
	}
}

export async function getBadges() {
	const getBadges = await fetch(`https://api.ivr.fi/v2/twitch/badges/global`);

	const badges = await getBadges.json();

	return Object.entries(badges).map(([_, data]) => ({
		set_id: data.set_id,
		versions: data.versions.map((version) => ({
			id: version.id,
			image_url_4x: version.image_url_4x,
			title: version.title
		}))
	}));
}

export async function getUserBadges(channelID, channelName, userName, filter) {
	if (!userName) userName = channelName;
	const getUserBadges = await fetch(`https://gql.twitch.tv/gql`, {
		credentials: 'omit',
		method: 'POST',
		headers: {
			'Accept-Language': 'en-US',
			'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko'
		},
		body: `[
            {
               "operationName":"ViewerCard",
               "variables":{
                    "channelID": "${channelID}",
                    "channelLogin": "${channelName}",
                    "hasChannelID": true,
                    "giftRecipientLogin": "${userName}",
                    "isViewerBadgeCollectionEnabled": true,
                    "withStandardGifting": true,
					"badgeSourceChannelID": "${channelID}",
					"badgeSourceChannelLogin": "${channelName}"
               },
               "extensions":{
                    "persistedQuery": {
                        "version": 1,
                        "sha256Hash": "80c53fe04c79a6414484104ea573c28d6a8436e031a235fc6908de63f51c74fd"
                  }
               }
            }
        ]`
	});

	const badgesData = (await getUserBadges.json())[0]?.data;
	const displayBadges =
		badgesData?.targetUser?.displayBadges?.map((badge) => ({
			setID: badge.setID,
			version: badge.version
		})) || [];
	const earnedBadges =
		badgesData?.channelViewer?.earnedBadges?.map((badge) => ({
			setID: badge.setID,
			image4x: badge.image4x,
			title: badge.title,
			version: badge.version
		})) || [];

	return { displayBadges, earnedBadges };
}

export const filteredBadges = [
	'lead_moderator',
	'artist-badge',
	'broadcaster',
	'subscriber',
	'sub-gifter',
	'hype-train',
	'moderator',
	'founder',
	'moments',
	'bits',
	'vip'
];

export const fallback = {
	displayBadges: [],
	earnedBadges: []
};
