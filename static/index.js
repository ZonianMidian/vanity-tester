import * as chatterino from '/providers/Chatterino.js';
import * as ffzap from '/providers/FrankerFaceZAP.js';
import * as dankchat from '/providers/DankChat.js';
import * as purpletv from '/providers/PurpleTV.js';
import * as ffz from '/providers/FrankerFaceZ.js';
import * as chatsen from '/providers/Chatsen.js';
import * as bttv from '/providers/BetterTTV.js';
import * as twitch from '/providers/Twitch.js';
import * as chatty from '/providers/Chatty.js';
import * as homies from '/providers/Homies.js';
import * as stv from '/providers/7TV.js';

let cosmeticsLoaded = false;
let chatterinoIDs = [];
let homiesCustomBadges;
let chatterinoBadges;
let purpletvIDs = [];
let chatsenIDs = [];
let bttvBadges = [];
let loaded = false;
let chattyIDs = [];
let homiesIDs = [];
let purpletvBadges;
let ffzapIDs = [];
let chatsenBadges;
let homiesBadges;
let stvCosmetics;
let dankIDs = [];
let twitchBadges;
let chattyBadges;
let ffzapBadges;
let ffzIDs = [];
let dankBadges;
let ffzBadges;
let bttvData;

async function fetchData() {
    const startFunction = performance.now();

    purpletvBadges = await getCachedOrFetch('purpletvBadges', () => purpletv.getBadges(), 24, purpletv.fallback);
    chatsenBadges = await getCachedOrFetch('chatsenBadges', () => chatsen.getBadges(), 24, chatsen.fallback);
    homiesCustomBadges = await getCachedOrFetch('homiesCustomBadges', () => homies.getCustomBadges(), 24);
    chatterinoBadges = await getCachedOrFetch('chatterinoBadges', () => chatterino.getBadges(), 24);
    const dankData = await getCachedOrFetch('dankchatBadges', () => dankchat.getBadges(), 24);
    ffzBadges = await getCachedOrFetch('ffzBadges', () => ffz.getBadges(), 24, ffz.fallback);
    homiesBadges = await getCachedOrFetch('homiesBadges', () => homies.getBadges(), 24);
    chattyBadges = await getCachedOrFetch('chattyBadges', () => chatty.getBadges(), 24);
    stvCosmetics = await getCachedOrFetch('stvCosmetics', () => stv.getCosmetics(), 24);
    twitchBadges = await getCachedOrFetch('twitchBadges', () => twitch.getBadges(), 24);
    ffzapBadges = await getCachedOrFetch('ffzapBadges', () => ffzap.getBadges(), 24);
    bttvData = await getCachedOrFetch('bttvBadges', () => bttv.getBadges(), 24);

    //PurpleTV
    purpletvIDs = purpletvBadges.users.map((b) => parseInt(b.userId));

    //Chatsen
    chatsenIDs = chatsenBadges.users.map((u) => parseInt(u.id));

    //Homies
    const homiesCustom = homiesCustomBadges.map((b) => Number(b.userId));
    const homiesRole = homiesBadges
        .map((object) => object.users.map((id) => parseInt(id)))
        .reduce((accumulator, currentValue) => accumulator.concat(currentValue), []);
    homiesIDs = [...homiesCustom, ...homiesRole];

    //Chatterino
    chatterinoIDs = chatterinoBadges
        .map((object) => object.users.map((id) => parseInt(id)))
        .reduce((accumulator, currentValue) => accumulator.concat(currentValue), []);

    //DankChat
    const uniqueDankBadges = {};
    const duplicateDankBadges = {};

    dankData.forEach((badge) => {
        const { type, users, url } = badge;
        if (uniqueDankBadges[type]) {
            uniqueDankBadges[type].users = [...new Set([...uniqueDankBadges[type].users, ...users])];
            duplicateDankBadges[type] = uniqueDankBadges[type];
            delete uniqueDankBadges[type];
        } else if (duplicateDankBadges[type]) {
            duplicateDankBadges[type].users = [...new Set([...duplicateDankBadges[type].users, ...users])];
        } else {
            uniqueDankBadges[type] = { type, users, url };
        }
    });
    dankBadges = [...Object.values(uniqueDankBadges), ...Object.values(duplicateDankBadges)];
    dankIDs = dankBadges
        .map((object) => object.users.map((id) => parseInt(id)))
        .reduce((accumulator, currentValue) => accumulator.concat(currentValue), []);

    //FrankerFaceZ
    for (const key in ffzBadges.users) {
        if (ffzBadges.users.hasOwnProperty(key)) {
            ffzIDs.push(...ffzBadges.users[key]);
        }
    }

    //Chatty
    chattyIDs = chattyBadges.map((b) => b.usernames).reduce((acc, userids) => acc.concat(userids), []);

    //FrankerFaceZ:AP
    ffzapIDs = ffzapBadges.map((b) => parseInt(b.id));

    //BetterTTV
    const uniqueBttvBadges = {};

    bttvData.forEach((item) => {
        const badge = item.badge;
        if (!uniqueBttvBadges[badge.type]) {
            uniqueBttvBadges[badge.type] = badge;
        }
    });

    bttvBadges = Object.values(uniqueBttvBadges).sort((a, b) => a.type - b.type);

    //Display
    loaded = true;
    const endFunction = performance.now();
    console.log(`Global data loaded in ${endFunction - startFunction}ms`);
}

let userLoaded = {
    loaded: false,
    paint: null,
    displayName: '',
    userID: '',
    tBadges: false,
    tBadge: [],
    sBadge: [],
};

async function fetchUserData(userName) {
    while (!loaded) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    try {
        const startFunction = performance.now();
        loadingCircle();

        userLoaded = {
            loaded: false,
            paint: null,
            displayName: '',
            userID: '',
            ffzBadges: false,
            tBadges: false,
            tBadge: [],
            sBadge: [],
        };

        //User Info
        const userData = await getCachedOrFetch(
            `twitchUser:${userName.toLocaleLowerCase()}`,
            () => twitch.getUserData(userName),
            1,
        );
        if (!userData.length) {
            document.getElementById('rotating-circle').style.display = 'none';
            handleDisplayTextChange(userName);
            changeLink();
            return;
        }

        const userID = Number(userData[0].id);
        let userBadge = userData[0].badges[0] ?? [];

        const displayName =
            userData[0].displayName.toLowerCase() == userData[0].login ? userData[0].displayName : userData[0].login;
        handleColorChange(userData[0].chatColor);
        handleDisplayTextChange(displayName);
        setCookie('userName', displayName);
        maxWidthVisualizer();

        //Twitch
        let { displayBadges, earnedBadges } = await getCachedOrFetch(
            `twitchUserBadges:${userID}`,
            () => twitch.getUserBadges(userID, displayName),
            1,
            twitch.fallback,
        );
        earnedBadges = earnedBadges?.filter((b) => !twitch.filteredBadges.includes(b.setID)) ?? [];

        let staff = false;
        if (userBadge.setID == 'staff') {
            staff = true;
            userBadge = displayBadges.pop();
        }

        createBadgeElement(
            '<i class="fa-solid fa-eye-slash"></i>',
            'No Twitch Badge',
            () => clearBadges('twitch'),
            'twitch-base',
            earnedBadges.length > 0,
        );

        for (const badge of twitchBadges) {
            const rightSet = earnedBadges.filter((b) => b.setID == badge.set_id)[0];
            const versions = sortArray(badge.versions);
            for (const version of versions) {
                const rightVersion = version.id == rightSet?.version;
                const userHasBadge = rightSet && rightVersion;

                let badgeImage;
                switch (badge.set_id) {
                    case 'vip':
                    case 'moderator': {
                        badgeImage = `<img src='${version.image_url_4x}' class='${badge.set_id}Badge' alt='Twitch Badge'>`;
                        window.badges[badge.set_id] = version.image_url_4x;
                        break;
                    }
                    default: {
                        badgeImage = `<img src='${version.image_url_4x}' alt='Twitch Badge'>`;
                    }
                }

                createBadgeElement(
                    badgeImage,
                    version.title,
                    () => applyBadge(version.image_url_4x, version.title, 'twitch', null, badge.set_id),
                    'twitch-base',
                    userHasBadge,
                );

                if (badge.set_id == userBadge.setID && version.id == userBadge.version) {
                    userLoaded.tBadge = [version.image_url_4x, version.title, 'twitch', null, badge.set_id];
                    applyBadge(
                        userLoaded.tBadge[0],
                        userLoaded.tBadge[1],
                        userLoaded.tBadge[2],
                        userLoaded.tBadge[3],
                        userLoaded.tBadge[4],
                    );
                } else if (badge.set_id == 'staff' && staff) {
                    userLoaded.sBadge = [version.image_url_4x, version.title, 'twitch', null, badge.set_id];
                    applyBadge(
                        userLoaded.sBadge[0],
                        userLoaded.sBadge[1],
                        userLoaded.sBadge[2],
                        userLoaded.sBadge[3],
                        userLoaded.sBadge[4],
                    );
                }
            }
        }

        //BetterTTV
        createBadgeElement(
            '<i class="fa-solid fa-eye-slash"></i>',
            'No BTTV Badge',
            () => clearBadges('bttv'),
            'bttv',
            bttvData.filter((u) => u.providerId == userID).length > 0,
        );

        for (const badge of bttvBadges) {
            const userHasBadge =
                bttvData.filter((u) => u.providerId == userID && u.badge.type == badge.type).length > 0;
            const badgeImage = badge.svg;
            createBadgeElement(
                `<img src='${badgeImage}' alt='BTTV Badge'>`,
                badge.description,
                () => applyBadge(badgeImage, badge.description, 'bttv'),
                'bttv',
                userHasBadge,
            );

            if (userHasBadge) {
                applyBadge(badgeImage, badge.description, 'bttv');
            }
        }

        //FrankerFaceZ
        createBadgeElement(
            '<i class="fa-solid fa-eye-slash"></i>',
            'No FFZ Badge',
            () => clearBadges('ffz'),
            'ffz',
            ffzIDs.includes(userID),
        );

        let ffzBadge = false;
        for (const badge of ffzBadges.badges) {
            const badgeID = badge.id;
            const badgeImage = `https://cdn.frankerfacez.com/badge/${badgeID}/4`;

            if (badge.id === 1 || badge.id === 2) {
                ffzBadge = ffzBadges.users[badge.id].includes(userID);
            } else if (badge.id === 4) {
                ffzBadge = ffzBadges.users[1].includes(userID) || ffzBadges.users[4].includes(userID);
            } else if (badge.id === 3) {
                ffzBadge =
                    ffzBadges.users[1].includes(userID) ||
                    ffzBadges.users[4].includes(userID) ||
                    ffzBadges.users[3].includes(userID);
            }

            createBadgeElement(
                `<img src='${badgeImage}' alt='FFZ Badge' class='ffzBadge' style='background-color: ${badge.color};'>`,
                badge.title,
                () => applyBadge(badgeImage, badge.title, 'ffz', badge.color, badge.name),
                'ffz',
                ffzBadge,
            );

            if (ffzBadges.users[badge.id].includes(userID)) {
                applyBadge(badgeImage, badge.title, 'ffz', badge.color, badge.name);
            }
        }

        //FrankerFaceZ:AP
        createBadgeElement(
            '<i class="fa-solid fa-eye-slash"></i>',
            'No FFZ:AP Badge',
            () => clearBadges('ffzap'),
            'ffzap',
            ffzapIDs.includes(userID),
        );

        let tier3Hashes = [];
        for (const badge of ffzapBadges) {
            const userHasBadge = Number(badge.id) == userID;

            const colorHTML = badge.badge_is_colored ? `style='background-color: ${badge.badge_color};'` : '';
            const badgeLink = `https://api.ffzap.com/v1/user/badge/${badge.id}/3`;
            const colorCode = badge.badge_is_colored ? badge.badge_color : null;
            const title = 'FFZ:AP Supporter';

            if (userHasBadge) {
                applyBadge(badgeLink, ffzap.helpers[badge.id] ?? title, 'ffzap', colorCode);
            }

            let removedFromGlobal = true;
            if (badge.tier == 3) {
                const badgeHash = await getImageHash(badgeLink);

                if (!tier3Hashes.includes(badgeHash)) {
                    tier3Hashes.push(badgeHash);
                    removedFromGlobal = false;
                }
            }

            createBadgeElement(
                `<img src='${badgeLink}' alt='FFZ:AP Badge' class='ffzBadge'${colorHTML}>`,
                title,
                () => applyBadge(badgeLink, title, 'ffzap', colorCode),
                'ffzap',
                userHasBadge,
                removedFromGlobal,
            );
        }

        //Chatterino
        createBadgeElement(
            '<i class="fa-solid fa-eye-slash"></i>',
            'No Chatterino Badge',
            () => clearBadges('chatterino'),
            'chatterino',
            chatterinoIDs.includes(userID),
        );

        for (const badge of chatterinoBadges) {
            const userHasBadge = badge.users.includes(userID.toString());
            createBadgeElement(
                `<img src='${badge.image3}' alt='Chatterino Badge'>`,
                badge.tooltip,
                () => applyBadge(badge.image3, badge.tooltip, 'chatterino'),
                'chatterino',
                userHasBadge,
            );

            if (userHasBadge) {
                applyBadge(badge.image3, badge.tooltip, 'chatterino');
            }
        }

        //DankChat
        createBadgeElement(
            '<i class="fa-solid fa-eye-slash"></i>',
            'No DankChat Badge',
            () => clearBadges('dankchat'),
            'dankchat',
            dankIDs.includes(userID),
        );

        let dankBadge = false;
        for (const badge of dankBadges) {
            const userHasBadge = badge.users.includes(userID.toString());
            createBadgeElement(
                `<img src='${badge.url}' alt='DankChat Badge'>`,
                badge.type,
                () => applyBadge(badge.url, badge.type, 'dankchat'),
                'dankchat',
                userHasBadge,
            );

            if (userHasBadge && !dankBadge) {
                dankBadge = true;
                applyBadge(badge.url, badge.type, 'dankchat');
            }
        }

        //Chatty
        createBadgeElement(
            '<i class="fa-solid fa-eye-slash"></i>',
            'No Chatty Badge',
            () => clearBadges('chatty'),
            'chatty',
            chattyIDs.includes(userData[0].login),
        );

        for (const badge of chattyBadges) {
            const userHasBadge = badge.usernames.includes(userData[0].login);
            createBadgeElement(
                `<img src='${badge.image_url_4}' alt='Chatty Badge'>`,
                badge.meta_title,
                () => applyBadge(badge.image_url_4, badge.meta_title, 'chatty'),
                'chatty',
                userHasBadge,
            );

            if (userHasBadge) {
                applyBadge(badge.image_url_4, badge.meta_title, 'chatty');
            }
        }

        //7TV
        const getStvUserCosmetics = await getCachedOrFetch(`7tvCosmetics:${userID}`, () => stv.getUserData(userID), 1);
        const stvUserCosmetics = getStvUserCosmetics?.map((c) => c.id) || [];

        const stvUserBadges = getStvUserCosmetics?.filter((b) => b.kind == 'BADGE') || [];
        const stvUserPaints = getStvUserCosmetics?.filter((p) => p.kind == 'PAINT') || [];

        createBadgeElement(
            '<i class="fa-solid fa-eye-slash"></i>',
            'No 7TV Badge',
            () => clearBadges('7tv'),
            '7tv',
            stvUserBadges.length > 0,
        );

        for (const badge of stvCosmetics.badges) {
            const badgeID = badge.id;
            const badgeImage = `https://cdn.7tv.app/badge/${badgeID}/3x`;
            createBadgeElement(
                `<img src='${badgeImage}' alt='7TV Badge'>`,
                badge.tooltip,
                () => applyBadge(badgeImage, badge.tooltip, '7tv'),
                '7tv',
                stvUserCosmetics.includes(badgeID),
            );

            const getBadge = getStvUserCosmetics?.find((x) => x.id == badgeID);
            if (getBadge?.selected) {
                applyBadge(badgeImage, badge.tooltip, '7tv');
            }
        }

        createPaintElement('No 7TV Paint', 'var(--user-color)', clearPaint, null, stvUserPaints.length > 0);

        for (const paint of stvCosmetics.paints) {
            const paintID = paint.id;
            createPaintElement(
                paint.name,
                '',
                () => applyPaint('userName', paint),
                paintID,
                stvUserCosmetics.includes(paintID),
            );
            applyPaint(paintID, paint);

            const getPaint = getStvUserCosmetics?.find((x) => x.id == paintID);
            if (getPaint?.selected) {
                userLoaded.paint = paint;
                applyPaint('userName', paint);
            }
        }

        //Chatsen
        createBadgeElement(
            '<i class="fa-solid fa-eye-slash"></i>',
            'No Chatsen Badge',
            () => clearBadges('chatsen'),
            'chatsen',
            chatsenIDs.includes(userID),
        );

        const chatsenUser = chatsenBadges.users.find((u) => u.id == String(userID));
        for (const badge of chatsenBadges.badges) {
            const userHasBadge = chatsenUser?.badges.filter((b) => b.badgeName == badge.name).length > 0;
            createBadgeElement(
                `<img src='${badge.image}' alt='Chatsen Badge'>`,
                badge.title,
                () => applyBadge(badge.image, badge.title, 'chatsen', null, badge.name),
                'chatsen',
                userHasBadge,
            );

            if (userHasBadge) {
                applyBadge(badge.image, badge.title, 'chatsen', null, badge.name);
            }
        }

        //Homies
        createBadgeElement(
            '<i class="fa-solid fa-eye-slash"></i>',
            'No Homies Badge',
            () => clearBadges('homies'),
            'homies',
            homiesIDs.includes(userID),
        );

        const homiesBadge = homiesCustomBadges.find((b) => b.userId == userID);
        if (homiesBadge) {
            const badgeName = `Homies ${displayName} Badge`;

            createBadgeElement(
                `<img src='${homiesBadge.image3}' alt='Homies Badge'>`,
                badgeName,
                () => applyBadge(homiesBadge.image3, badgeName, 'user'),
                'homies',
                true,
                true,
            );

            applyBadge(homiesBadge.image3, badgeName, 'user');
        }

        for (const badge of homiesBadges) {
            const userHasBadge = badge.users.includes(userID.toString());
            createBadgeElement(
                `<img src='${badge.image3}' alt='Homies Badge'>`,
                badge.tooltip,
                () => applyBadge(badge.image3, badge.tooltip, 'homies-base'),
                'homies',
                userHasBadge,
            );

            if (userHasBadge) {
                applyBadge(badge.image3, badge.tooltip, 'homies-base');
            }
        }

        //PurpleTV
        createBadgeElement(
            '<i class="fa-solid fa-eye-slash"></i>',
            'No PurpleTV Badge',
            () => clearBadges('purpletv'),
            'purpletv',
            purpletvIDs.includes(userID),
        );

        let purpleUniqueBadges = [];

        for (const user of purpletvBadges.users) {
            const customBadge = user.badgeUrl.length > 0;
            const devBadge = user.userId == '157861306';
            const userHasBadge = user.userId == String(userID);
            const userBadge =
                user.badgeUrl.length > 0
                    ? user.badgeUrl.replace('nopbreak.ru', 'nopbreak.ws')
                    : purpletvBadges.defaultBadgeUrl;
            const badgeTile = devBadge
                ? 'PurpleTV Developer'
                : customBadge
                  ? 'PurpleTV Custom Badge'
                  : 'PurpleTV Donor Badge';
            createBadgeElement(
                `<img src='${userBadge}' alt='PurpleTV Badge'>`,
                badgeTile,
                () => applyBadge(userBadge, badgeTile, 'purpletv'),
                'purpletv',
                userHasBadge,
                purpleUniqueBadges.includes(userBadge),
            );
            purpleUniqueBadges.push(userBadge);

            if (userHasBadge) {
                applyBadge(userBadge, badgeTile, 'purpletv');
            }
        }

        //Display
        userLoaded.ffzBadges = ffzIDs.includes(userID);
        userLoaded.tBadges = earnedBadges.length > 0;
        userLoaded.displayName = displayName;
        userLoaded.userID = userID;
        userLoaded.loaded = true;
        changeLink();

        if (!cosmeticsLoaded) {
            const sections = document.getElementById('sections');
            sections.style.display = 'block';
            cosmeticsLoaded = true;
        }

        const userCosmetics = document.querySelectorAll('.userCosmetics');
        const button = document.getElementById('toggle-mode');
        if (button.textContent === 'Free Mode') {
            userCosmetics.forEach((element) => {
                element.style.display = 'flex';
            });
        }

        const checkboxes = document.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach((checkbox) => {
            checkbox.disabled = false;
        });

        document.getElementById('customChannel').disabled = false;
        document.getElementById('buttonMenu').style.display = 'flex';
        document.getElementById('optionsMessage').style.display = 'none';
        document.getElementById('search-button').style.display = 'block';
        document.getElementById('rotating-circle').style.display = 'none';

        setTimeout(() => maxWidthVisualizer(), 1000);

        const endFunction = performance.now();
        console.log(`User "${displayName}" loaded in ${endFunction - startFunction}ms`);
    } catch (error) {
        document.getElementById('rotating-circle').style.display = 'none';
        console.error('User Error:', error);
        maxWidthVisualizer();
    }
}

let ffzCustomBadges = {
    mod: null,
    vip: null,
};

async function fetchChannelData(userName) {
    try {
        const startFunction = performance.now();
        loadingCircle();

        const channelData = await getCachedOrFetch(
            `twitchUser:${userName.toLocaleLowerCase()}`,
            () => twitch.getUserData(userName),
            1,
        );
        if (!channelData.length) return;
        const channelID = Number(channelData[0].id);

        const channelBadges = await getCachedOrFetch(
            `twitchChannelBadges:${channelID}`,
            () => twitch.getChannelData(userName),
            1,
        );

        const channelName =
            channelData[0].displayName.toLowerCase() == channelData[0].login
                ? channelData[0].displayName
                : channelData[0].login;
        document.getElementById('customChannel').value = channelName;

        //Twitch Channel
        for (const badge of channelBadges) {
            const versions = sortArray(badge.versions);
            for (const version of versions) {
                createBadgeElement(
                    `<img src='${version.image_url_4x}' alt='Twitch Badge'>`,
                    version.title,
                    () => applyBadge(version.image_url_4x, version.title, 'twitch', null, badge.set_id),
                    'twitch-channel',
                    false,
                );
            }
        }

        //FrankerFaceZ Channel
        ffzCustomBadges = {
            mod: null,
            vip: null,
        };

        const { moderatorBadge, vipBadge } = await getCachedOrFetch(
            `ffzChannelBadges:${channelID}`,
            () => ffz.getChannel(channelID),
            1,
            ffz.customFallback,
        );
        await handleCustomBadges(moderatorBadge, vipBadge);

        const { displayBadges, earnedBadges } = await getCachedOrFetch(
            `twitchChannelBadges:${channelID}:${userLoaded.userID}`,
            () => twitch.getUserBadges(channelID, channelName, userLoaded.displayName),
            1,
        );

        if (!userLoaded.tBadges)
            createBadgeElement(
                '<i class="fa-solid fa-eye-slash"></i>',
                'No Twitch Badge',
                () => clearBadges('twitch'),
                'twitch-channel',
                earnedBadges.length > 0,
                true,
            );

        const checkbox = document.getElementById(`check-ffzbadges`);
        const displayValue = checkbox.checked;

        //Twitch User
        for (const badge of earnedBadges) {
            if (twitch.filteredBadges.includes(badge.setID)) {
                let badgeImage;
                let badgeLink = badge.image4x;
                switch (badge.setID) {
                    case 'vip': {
                        if (vipBadge && displayValue) {
                            badgeLink = ffzCustomBadges.vip;
                            badgeImage = `<img src='${badgeLink}' alt='FFZ Badge' class='vipBadge'>`;
                        } else {
                            badgeImage = `<img src='${badgeLink}' alt='Twitch Badge' class='vipBadge'>`;
                        }
                        break;
                    }
                    case 'moderator': {
                        if (moderatorBadge && displayValue) {
                            badgeLink = ffzCustomBadges.mod;
                            badgeImage = `<img src='${badgeLink}' alt='FFZ Badge' class='moderatorBadge' style='background-color: #00AD03;'>`;
                        } else {
                            badgeImage = `<img src='${badgeLink}' alt='Twitch Badge' class='moderatorBadge'>`;
                        }
                        break;
                    }
                    default: {
                        badgeImage = `<img src='${badge.image4x}' alt='Twitch Badge'>`;
                    }
                }

                const badgeColor = moderatorBadge && badge.setID == 'moderator' ? '#00AD03' : null;

                createBadgeElement(
                    badgeImage,
                    badge.title,
                    () => applyBadge(badgeLink, badge.title, 'twitch', badgeColor, badge.setID),
                    'twitch-channel',
                    true,
                    true,
                );

                if (displayBadges.filter((b) => b.setID == badge.setID && b.version == badge.version).length > 0) {
                    applyBadge(badgeLink, badge.title, 'twitch', badgeColor, badge.setID);
                }
            }
        }

        //Display
        document.getElementById('rotating-circle').style.display = 'none';
        document.getElementById('customChannel').disabled = false;
        changeLink(channelName);

        const endFunction = performance.now();
        console.log(
            `User "${userLoaded.displayName}" with channel "${channelName}" loaded in ${endFunction - startFunction}ms`,
        );
    } catch (error) {
        console.error('Channel Error:', error);
    }
}

function sortArray(arr) {
    function compararObjetos(a, b) {
        const numeroA = parseInt(a.id.match(/\d+/));
        const numeroB = parseInt(b.id.match(/\d+/));

        if (isNaN(numeroA) || isNaN(numeroB)) {
            return isNaN(numeroA) ? -1 : 1;
        }

        return numeroA - numeroB;
    }

    arr.sort(compararObjetos);

    return arr;
}

async function handleCustomBadges(moderator, vip, reset) {
    const moderatorBadge = document.querySelectorAll('.moderatorBadge');
    const vipBadge = document.querySelectorAll('.vipBadge');

    if (reset) {
        moderatorBadge.forEach((badge) => {
            badge.style.backgroundColor = '';
            badge.src = window.badges.moderator;
        });

        vipBadge.forEach((badge) => {
            badge.src = window.badges.vip;
        });
    }

    const checkbox = document.getElementById(`check-ffzbadges`);
    const displayValue = checkbox.checked;

    if (moderator) {
        ffzCustomBadges.mod = moderator;
        if (displayValue) {
            moderatorBadge.forEach((badge) => {
                badge.style.backgroundColor = '#00AD03';
                badge.className = 'moderatorBadge';
                badge.src = moderator;
            });
        }
    }
    if (vip) {
        ffzCustomBadges.vip = vip;
        if (displayValue) {
            vipBadge.forEach((badge) => {
                badge.className = 'vipBadge';
                badge.src = vip;
            });
        }
    }
}

function applyBadge(badgeLink, badgeName, platform, color, type) {
    const allUserBadges = document.getElementById('allUserBadges');
    allUserBadges.style.width = 'auto';

    const checkbox = document.getElementById(`check-ffzbadges`);
    const displayValue = checkbox.checked;

    let divName;
    switch (platform) {
        case 'twitch':
            switch (type) {
                case 'broadcaster':
                    divName = 'role';
                    break;
                case 'moderator':
                    divName = 'role';
                    if (displayValue) {
                        badgeLink = ffzCustomBadges.mod ?? badgeLink;
                        color = '#00AD03';
                    }
                    break;
                case 'vip':
                    divName = 'role';
                    if (displayValue) {
                        badgeLink = ffzCustomBadges.vip ?? badgeLink;
                    }
                    break;
                case 'subscriber':
                    divName = 'sub';
                    break;
                case 'staff':
                    divName = 'staff';
                    break;
                default:
                    divName = 'twitch-base';
                    break;
            }
            break;
        case 'ffz':
            switch (type) {
                case 'bot':
                    divName = 'bot';
                    break;
                default:
                    divName = 'ffz-base';
                    break;
            }
            break;
        case 'chatsen':
            if (type == 'developer') {
                divName = 'dev';
            } else if (chatsen.relaxo.includes(type)) {
                divName = 'relaxo';
            } else if (chatsen.patreon.includes(type)) {
                divName = 'patreon';
            } else {
                divName = 'chatsen-base';
            }
            break;
        default:
            divName = platform;
            break;
    }
    const platformSubdiv = allUserBadges.querySelector(`.badge-${divName}`);

    clearBadges(divName);

    if (platformSubdiv) {
        platformSubdiv.style.display = '';

        const badgeImage = createBadgeImage(badgeLink, badgeName, color);
        platformSubdiv.appendChild(badgeImage);
    }

    maxWidthVisualizer();
}

function createBadgeImage(link, title, color) {
    const badgeImage = document.createElement('img');
    badgeImage.style.height = badgeSize;
    badgeImage.src = link;
    badgeImage.title = title;
    badgeImage.alt = title;
    badgeImage.draggable = false;
    badgeImage.style.backgroundColor = color;
    if (color) {
        if (title == 'Moderator') badgeImage.className = 'moderatorBadge';
        else if (title == 'FFZ:AP Supporter') badgeImage.className = 'ffzBadge';
    }
    if (title == 'VIP') badgeImage.className = 'vipBadge';
    return badgeImage;
}

function clearBadges(platform) {
    const badgesSection = document.getElementById('allUserBadges');
    if (!platform) {
        const subDivs = badgesSection.querySelectorAll('div');

        for (const div of subDivs) {
            const imagen = div.querySelector('img');
            div.style.display = 'none';
            if (imagen) {
                imagen.remove();
            }
        }
        maxWidthVisualizer();
        return;
    }

    const badges = badgesSection.querySelectorAll(`.badge-${platform}`);
    for (const badge of badges) {
        const badgeImg = badge.querySelector('img');
        badge.style.display = 'none';
        if (badgeImg) {
            badgeImg.remove();
        }
    }
    maxWidthVisualizer();
}

function applyPaint(ID, paint) {
    if (!paint) return;
    document.querySelectorAll(`[data-paint-id='${ID}']`).forEach((editText) => {
        if (paint.function === 'LINEAR_GRADIENT' && paint.stops && paint.stops.length > 0) {
            const gradientStops = paint.stops.map((stop) => {
                const colorString = '#' + (stop.color >>> 0).toString(16).padStart(8, '0');
                return `${colorString} ${stop.at * 100}%`;
            });
            const gradientDirection = `${paint.angle}deg`;
            const gradient = paint.repeat
                ? `repeating-linear-gradient(${gradientDirection}, ${gradientStops.join(', ')})`
                : `linear-gradient(${gradientDirection}, ${gradientStops.join(', ')})`;
            editText.style.backgroundImage = gradient;
        } else if (paint.function === 'RADIAL_GRADIENT' && paint.stops && paint.stops.length > 0) {
            const gradientStops = paint.stops.map((stop) => {
                const colorString = '#' + (stop.color >>> 0).toString(16).padStart(8, '0');
                return `${colorString} ${stop.at * 100}%`;
            });
            const gradient = `radial-gradient(circle, ${gradientStops.join(', ')})`;
            editText.style.backgroundImage = gradient;
        } else if (paint.function === 'URL' && paint.image_url) {
            editText.style.backgroundImage = `url('${paint.image_url}')`;
        }

        if (paint.shadows && paint.shadows.length > 0) {
            const dropShadows = paint.shadows.map((shadow) => {
                const colorString = '#' + (shadow.color >>> 0).toString(16).padStart(8, '0');
                return `drop-shadow(${colorString} ${shadow.x_offset}px ${shadow.y_offset}px ${shadow.radius}px)`;
            });
            editText.style.filter = dropShadows.join(' ');
        } else {
            editText.style.filter = '';
        }
    });
}

function clearPaint() {
    const editText = document.getElementById('editText');
    editText.style.backgroundImage = '';
    editText.style.filter = '';
}

async function getImageHash(imageURL) {
    const cachedHash = getCookie(imageURL);
    if (cachedHash) {
        return cachedHash;
    }

    try {
        const response = await fetch(imageURL);
        if (!response.ok) {
            throw new Error();
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const array = Array.from(new Uint8Array(buffer));
        const hash = array.map((byte) => byte.toString(16).padStart(2, '0')).join('');

        setCookie(imageURL, hash, 1);

        return hash;
    } catch (error) {
        return null;
    }
}

async function getCachedOrFetch(key, fetchFunction, expirationTimeInHours, fallback) {
    const start = performance.now();

    try {
        let cachedData = localStorage.getItem(key);

        if (cachedData) {
            const cachedTime = localStorage.getItem(`${key}_timestamp`);
            if (cachedTime && Date.now() - parseInt(cachedTime) < expirationTimeInHours * 60 * 60 * 1000) {
                cachedData = JSON.parse(cachedData);
                console.log(`Key "${key}" fetched from cache in ${performance.now() - start}ms`);
                if (cachedData) return cachedData;
            }
        } else {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Execution exceeded the 10-second limit'));
                }, 10000);
            });

            const fetchedDataPromise = fetchFunction();
            let fetchedData;

            try {
                fetchedData = await Promise.race([fetchedDataPromise, timeoutPromise]);
            } catch (timeoutError) {
                throw timeoutError;
            }

            localStorage.setItem(key, JSON.stringify(fetchedData));
            localStorage.setItem(`${key}_timestamp`, Date.now().toString());
            console.log(`Key "${key}" fetched in ${performance.now() - start}ms`);
            return fetchedData;
        }
    } catch (e) {
        console.error(`Key "${key}" fetch failed in ${performance.now() - start}ms - ${e}`);
        return fallback ?? [];
    }
}

function getVisualizerWidth() {
    return Number(
        document.getElementById('allUserBadges').offsetWidth + document.getElementById('editText').offsetWidth,
    );
}

function elementSize() {
    return document.getElementById('editText').offsetHeight > document.getElementById('allUserBadges').offsetHeight;
}

function getParam(param) {
    const URL = window.location.href;

    const params = URL.split('?')[1];

    if (params) {
        const pares = params.split('&');

        for (let i = 0; i < pares.length; i++) {
            const par = pares[i].split('=');
            if (par[0] === param) {
                return decodeURI(par[1]);
            }
        }
    }

    return null;
}

function loadingCircle() {
    document.getElementById('rotating-circle').style.display = 'block';
    document.getElementById('user-arrow').style.display = 'none';
}

const firstSize = '70px';
let badgeSize = firstSize;

window.maxWidthVisualizer = function () {
    adjustInputWidth();
    let visualizerWidth = getVisualizerWidth();
    let pageWidth = window.innerWidth < 1024 ? window.innerWidth - 20 : window.innerWidth - 50;

    let badgeImages = document.querySelectorAll('#allUserBadges div img');
    let editText = document.getElementById('editText');

    if (visualizerWidth > pageWidth) {
        while (visualizerWidth > pageWidth && parseFloat(editText.style.fontSize) > 0) {
            while (elementSize() && parseFloat(editText.style.fontSize) > 0) {
                const currentFontSize = parseFloat(editText.style.fontSize);
                editText.style.fontSize = `${(currentFontSize - 0.1).toFixed(1)}px`;
            }

            for (let i = 0; i < badgeImages.length; i++) {
                const currentHeight = parseFloat(badgeImages[i].style.height);
                badgeSize = badgeImages[i].style.height = `${(currentHeight - 0.1).toFixed(1)}px`;
            }

            visualizerWidth = getVisualizerWidth();
            adjustInputWidth();
        }
    } else {
        while (visualizerWidth < pageWidth && parseFloat(editText.style.fontSize) < 70) {
            const currentFontSize = parseFloat(editText.style.fontSize);
            editText.style.fontSize = `${(currentFontSize + 0.1).toFixed(1)}px`;

            for (let i = 0; i < badgeImages.length; i++) {
                const currentHeight = parseFloat(badgeImages[i].style.height);
                badgeSize = badgeImages[i].style.height = `${(currentHeight + 0.1).toFixed(1)}px`;
            }

            visualizerWidth = getVisualizerWidth();
            adjustInputWidth();
        }
    }
};

window.clearStorage = function () {
    for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            localStorage.removeItem(key);
        }
    }
    setCookie('userName', '', -1);
    location.reload();
};

window.setCookie = function (name, value, days) {
    let expires = '';

    if (days) {
        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + days * 24 * 60 * 60 * 1000);
        expires = `; expires=${expirationDate.toUTCString()}; path=/`;
    }

    if (typeof value === 'object') {
        value = JSON.stringify(value);
    }

    document.cookie = `${name}=${value}${expires}`;
};

window.getCookie = function (name) {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
            return cookieValue;
        }
    }
    return null;
};

let timeoutId;
window.handleTextChange = function (element) {
    const newText = handleDisplayTextChange(element.value);
    if (!newText.length) return;

    if (timeoutId) {
        clearTimeout(timeoutId);
    }

    if (newText.toLocaleLowerCase() == userLoaded.displayName.toLocaleLowerCase() || !newText.length) return;

    timeoutId = setTimeout(() => {
        clearBadges();
        clearPaint();

        clearFilter();
        loadingCircle();
        if (cosmeticsLoaded) handleCustomBadges(null, null, true);

        const badgesSection = document.getElementById('badgesSection').querySelector('.userCosmetics');
        badgesSection.style.display = 'none';
        badgesSection.querySelectorAll('div').forEach((div) => {
            div.style.display = 'none';
            div.innerHTML = '';
        });

        const paintsSection = document.getElementById('paintsSection').querySelector('.userCosmetics');
        paintsSection.innerHTML = '';

        const channelName = getParam('c');

        maxWidthVisualizer();
        fetchUserData(newText).then(function () {
            if (channelName) {
                fetchChannelData(channelName);
            }
        });
    }, 2000);
};

window.toggleFFZBadges = function () {
    const checkbox = document.getElementById(`check-ffzbadges`);
    const displayValue = checkbox.checked;

    if (displayValue) {
        handleCustomBadges(ffzCustomBadges.mod, ffzCustomBadges.vip);
    } else {
        handleCustomBadges(null, null, true);
    }
};

window.adjustInputWidth = function () {
    const input = document.getElementById('editText');
    const text = input.value || input.placeholder;
    const font = window.getComputedStyle(input, null).getPropertyValue('font');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    const textWidth = context.measureText(text).width;
    input.style.width = textWidth + 'px';
    return textWidth;
};

window.toggleSection = function (sectionId) {
    const mainSection = document.getElementById(sectionId);
    const button = document.getElementById(`toggle-${sectionId}`);

    if (mainSection) {
        if (mainSection.style.display === 'none') {
            mainSection.style.display = 'block';
            if (button) button.style.backgroundColor = '';
        } else {
            mainSection.style.display = 'none';
            if (button) button.style.backgroundColor = '#0054ae';
        }
    }
};

window.toggleMode = function () {
    const allCosmeticsElements = document.querySelectorAll('.allCosmetics');
    const userCosmeticsElements = document.querySelectorAll('.userCosmetics');

    allCosmeticsElements.forEach((element) => {
        if (element.style.display === 'none') {
            element.style.display = '';
        } else {
            element.style.display = 'none';
        }
    });

    userCosmeticsElements.forEach((element) => {
        if (element.style.display === 'none') {
            element.style.display = '';
        } else {
            element.style.display = 'none';
        }
    });

    const button = document.getElementById('toggle-mode');
    if (button.textContent === 'Free Mode') {
        button.textContent = 'User Mode';
    } else {
        button.textContent = 'Free Mode';
    }
};

window.createBadgeElement = function (badgeImage, badgeName, onClickHandler, platform, userHasBadge, allRemoved) {
    const badgesSection = document.getElementById('badgesSection');
    const allUserBadges = badgesSection.querySelector('.allCosmetics').querySelector(`.platform-${platform}`);
    const userBadges = badgesSection.querySelector('.userCosmetics').querySelector(`.platform-${platform}`);

    const badgeElement = document.createElement('div');
    badgeElement.className = `badge`;
    badgeElement.dataset.badgeName = badgeName;
    badgeElement.innerHTML = badgeImage ?? '';
    badgeElement.onclick = onClickHandler;
    badgeElement.draggable = false;

    if ((!cosmeticsLoaded && !allRemoved) || (platform == 'twitch-channel' && !allRemoved))
        allUserBadges.appendChild(badgeElement);

    if (userHasBadge) {
        const clonedBadgeElement = badgeElement.cloneNode(true);
        clonedBadgeElement.onclick = onClickHandler;
        userBadges.appendChild(clonedBadgeElement);
        userBadges.style.display = 'flex';
    }
};

window.createPaintElement = function (paintName, backgroundColor, onClickHandler, id, userHasPaint) {
    const paintsSection = document.getElementById('paintsSection');
    const allPaints = paintsSection.querySelector('.allCosmetics');
    const userPaints = paintsSection.querySelector('.userCosmetics');

    const paintElement = document.createElement('div');
    paintElement.className = 'paint text-effect';
    paintElement.textContent = paintName;
    paintElement.style.backgroundColor = backgroundColor;
    paintElement.onclick = onClickHandler;

    if (id) {
        paintElement.dataset.paintId = id;
    }

    if (!cosmeticsLoaded) allPaints.appendChild(paintElement);

    if (userHasPaint) {
        const clonedPaintElement = paintElement.cloneNode(true);
        clonedPaintElement.onclick = onClickHandler;
        userPaints.appendChild(clonedPaintElement);
    }
};

window.handleDisplayTextChange = function (value) {
    value = value?.trim().replace(/[^a-zA-Z0-9_]/g, '');

    document.getElementById('editText').value = value;
    document.getElementById('displayName').value = value;

    maxWidthVisualizer();
    return value;
};

window.changeLink = function (channel) {
    const user = getCookie('userName');
    let newLink;

    if (!user) {
        return;
    } else {
        newLink = '?u=' + encodeURIComponent(user);
    }

    if (channel) {
        newLink += '&c=' + encodeURIComponent(channel);
    }

    window.history.pushState({}, '', newLink);
};

window.handleColorChange = function (value) {
    value = value?.toUpperCase() || '#FFFFFF';
    document.documentElement.style.setProperty('--user-color', value);
    document.getElementById('editText').style.backgroundColor = value;
    document.getElementById('colorPicker').value = value;
    document.querySelector('.clr-field').style.color = value;
};

let channelTimer;
window.handleChannelChange = function (value) {
    value = value.trim();
    clearTimeout(channelTimer);
    channelTimer = setTimeout(() => {
        document.getElementById('customChannel').disabled = true;

        clearFilter();
        clearBadges('twitch');
        if (cosmeticsLoaded) handleCustomBadges(null, null, true);
        if (userLoaded.tBadge[0])
            applyBadge(
                userLoaded.tBadge[0],
                userLoaded.tBadge[1],
                userLoaded.tBadge[2],
                userLoaded.tBadge[3],
                userLoaded.tBadge[4],
            );
        if (userLoaded.sBadge[0])
            applyBadge(
                userLoaded.sBadge[0],
                userLoaded.sBadge[1],
                userLoaded.sBadge[2],
                userLoaded.sBadge[3],
                userLoaded.sBadge[4],
            );

        const badges = document.querySelectorAll('.platform-twitch-channel');
        badges.forEach((badge) => {
            badge.innerHTML = '';
        });

        ffzCustomBadges = {
            mod: null,
            vip: null,
        };

        if (!userLoaded.loaded || !value.length) {
            document.querySelector('.platform-twitch-channel').style.display = 'none';
            document.getElementById('customChannel').disabled = false;
            changeLink();
            return;
        }
        fetchChannelData(value);
    }, 2000);
};

window.toggleProvider = function (providerId) {
    const checkbox = document.getElementById(`check-${providerId}`);
    const isCheckboxChecked = checkbox.checked;

    const platformElements = document.querySelectorAll(`.platform-${providerId}`);
    platformElements.forEach((element) => {
        if (isCheckboxChecked) {
            element.classList.remove('invisibleElement');
            element.classList.add('visibleElement');
        } else {
            element.classList.remove('visibleElement');
            element.classList.add('invisibleElement');
        }
    });

    const badgeElements = document.querySelectorAll(`.badge-${providerId}`);
    badgeElements.forEach((element) => {
        if (isCheckboxChecked) {
            element.classList.remove('invisibleElement');
            element.classList.add('visibleElement');
        } else {
            element.classList.remove('visibleElement');
            element.classList.add('invisibleElement');
        }
    });

    if (providerId == 'ffz') {
        const ffzBadges = document.getElementById('check-ffzbadges');
        if (isCheckboxChecked) {
            ffzBadges.disabled = false;
            if (ffzBadges.checked) handleCustomBadges(ffzCustomBadges.mod, ffzCustomBadges.vip);
        } else {
            ffzBadges.disabled = true;
            handleCustomBadges(null, null, true);
        }
    } else if (providerId == '7tv') {
        if (isCheckboxChecked) {
            applyPaint('userName', userLoaded.paint);
        } else {
            clearPaint();
        }
    }

    maxWidthVisualizer();
};

window.showSearchField = function () {
    const searchButton = document.getElementById('search-button');
    const searchField = document.getElementById('search-field');

    searchButton.style.display = 'none';
    searchField.style.display = 'block';
    searchField.focus();

    searchButton.addEventListener('click', function (event) {
        event.stopPropagation();
    });

    setTimeout(function () {
        document.addEventListener('click', function (event) {
            if (event.target !== searchField && event.target !== searchButton) {
                searchButton.style.display = 'block';
                searchField.style.display = 'none';
            }
        });
    }, 0);
};

window.filterItems = function (value) {
    const searchField = value.toLowerCase();
    const sections = document.getElementById('sections').children;

    for (const section of sections) {
        switch (section.id) {
            case 'badgesSection': {
                const types = section.children;
                for (const type of types) {
                    for (const platform of type.children) {
                        for (const badge of platform.children) {
                            const textToSearch = badge.dataset.badgeName?.toLowerCase();
                            if (textToSearch?.includes(searchField) || searchField === '') {
                                badge.classList.remove('invisibleElement');
                                badge.classList.add('visibleElement');
                            } else {
                                badge.classList.remove('visibleElement');
                                badge.classList.add('invisibleElement');
                            }
                        }
                    }
                }
                break;
            }
            case 'paintsSection': {
                const types = section.children;
                for (const type of types) {
                    for (const paint of type.children) {
                        const textToSearch = paint.textContent?.toLowerCase();
                        if (textToSearch?.includes(searchField) || searchField === '') {
                            paint.classList.remove('invisibleElement');
                            paint.classList.add('visibleElement');
                        } else {
                            paint.classList.remove('visibleElement');
                            paint.classList.add('invisibleElement');
                        }
                    }
                }
                break;
            }
        }
    }
};

window.clearFilter = function (menu) {
    filterItems('');

    const searchButton = document.getElementById('search-button');
    const searchField = document.getElementById('search-field');
    searchField.value = '';

    if (searchField.style.display == 'block') {
        searchButton.style.display = 'block';
        searchField.style.display = 'none';
    } else if (menu) {
        toggleSection('menu');
    }
};

window.badges = {
    mod: '',
    vip: '',
};

window.onload = async function () {
    fetchData();
    maxWidthVisualizer();

    const input = document.getElementById('editText');
    input.style.display = '';

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach((checkbox) => {
        checkbox.disabled = true;
        checkbox.checked = true;
    });

    const customChannel = document.getElementById('customChannel');
    customChannel.disabled = true;
    customChannel.value = '';

    let userName;
    const userParam = getParam('u');
    const channelName = getParam('c');
    const userCookie = getCookie('userName');
    if (userParam) {
        userName = userParam;
    } else if (userCookie) {
        userName = userCookie;
    } else {
        userName = '';
    }

    userName = handleDisplayTextChange(userName);
    if (userName.length) {
        clearBadges();
        loadingCircle();
        await fetchUserData(userName);
        handleDisplayTextChange(userName);
    }

    setTimeout(() => maxWidthVisualizer(), 1000);

    if (userParam && channelName?.length) {
        loadingCircle();
        await fetchChannelData(channelName);
    }
};

window.cors = 'https://corsproxy.io/?';

window.addEventListener('dragover', (e) => {
    e.preventDefault();
});

window.addEventListener('drop', () => {
    if (currentlyDragged && !container) {
        currentlyDragged.style.display = 'none';
    }
});

window.addEventListener('resize', maxWidthVisualizer);

let currentlyDragged = null;
let container = false;

document.querySelectorAll('.userBadge').forEach((badge) => {
    badge.addEventListener('dragstart', (e) => {
        currentlyDragged = badge;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', '');
    });

    badge.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    badge.addEventListener('dragenter', () => {
        if (currentlyDragged !== badge) {
            badge.style.opacity = '0.5';
            container = true;
        }
    });

    badge.addEventListener('dragleave', () => {
        badge.style.opacity = '1';
        container = false;
    });

    badge.addEventListener('drop', () => {
        if (currentlyDragged !== badge) {
            const parent = badge.parentNode;
            const containerIndex = Array.from(parent.children).indexOf(badge);
            const draggedIndex = Array.from(parent.children).indexOf(currentlyDragged);

            if (containerIndex < draggedIndex) {
                parent.insertBefore(currentlyDragged, badge);
            } else {
                parent.insertBefore(currentlyDragged, badge.nextSibling);
            }

            badge.style.opacity = '1';
        }
    });

    badge.addEventListener('dragend', () => {
        currentlyDragged = null;
    });
});

const konamiCode = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'KeyB',
    'KeyA',
];
let konamiCodePosition = 0;

document.addEventListener('keydown', function (e) {
    const key = e.code;

    if (key === konamiCode[konamiCodePosition]) {
        konamiCodePosition++;

        if (konamiCodePosition === konamiCode.length) {
            console.log('Konami Code Activated!');
            const allCosmeticsDiv = document.querySelector('#paintsSection .allCosmetics');

            if (allCosmeticsDiv) {
                allCosmeticsDiv.classList.remove('invisibleElement');
            }
            konamiCodePosition = 0;
        }
    } else {
        konamiCodePosition = 0;
    }
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' || event.key === 'Esc') clearFilter(true);
});
