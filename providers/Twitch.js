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

        return await channelData.json();
    } catch (error) {
        return [];
    }
}

export async function getBadges() {
    const getBadges = await fetch(`https://api.ivr.fi/v2/twitch/badges/global`);
    return await getBadges.json();
}

export async function getUserBadges(channelID, channelName, userName, filter) {
    if (!userName) userName = channelName;
    const getUserBadges = await fetch(`${window.cors}https://gql.twitch.tv/gql`, {
        credentials: 'omit',
        method: 'POST',
        headers: {
            'Accept-Language': 'en-US',
            'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
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
                    "withStandardGifting": true
               },
               "extensions":{
                    "persistedQuery": {
                        "version": 1,
                        "sha256Hash": "823772cac91efa0a24f86a80463f37f0377cb216d7ce57a4ab90b61d1e01de8b"
                  }
               }
            }
        ]`,
    });

    const badgesData = (await getUserBadges.json())[0]?.data;
    const displayBadges = badgesData?.targetUser?.displayBadges || [];
    const earnedBadges = badgesData?.channelViewer?.earnedBadges || [];

    return { displayBadges, earnedBadges };
}

export const filteredBadges = [
    'artist-badge',
    'broadcaster',
    'subscriber',
    'sub-gifter',
    'hype-train',
    'moderator',
    'founder',
    'moments',
    'bits',
    'vip',
];
