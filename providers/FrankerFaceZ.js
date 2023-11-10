export async function getBadges() {
    const getBadges = await fetch(`${window.cors}https://api.frankerfacez.com/v1/badges/ids`);
    return await getBadges.json();
}

export async function getChannel(channelID) {
    try {
        const getChannel = await fetch(`${window.cors}https://api.frankerfacez.com/v1/room/id/${channelID}`);
        const channelData = (await getChannel.json()).room;

        let moderatorBadge = channelData.moderator_badge;
        let vipBadge = null;
        if (channelData.vip_badge) {
            vipBadge = getLastValue(channelData.vip_badge);
        }

        return { moderatorBadge, vipBadge };
    } catch {
        return { moderatorBadge: null, vipBadge: null };
    }
}

function getLastValue(obj) {
    return obj[Object.keys(obj)[Object.keys(obj).length - 1]];
}