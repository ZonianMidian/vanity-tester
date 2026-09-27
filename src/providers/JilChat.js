export async function getBadges() {
    const response = await fetch(`${window.cors}https://api.jil.chat/v1/badges`);
    return (await response.json());
};

export async function getUserBadges(userID) {
    const response = await fetch(`${window.cors}https://api.jil.chat/v1/badges/user/${userID}/all`); 
    return (await response.json()); 
};