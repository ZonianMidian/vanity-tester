export async function getBadges() {
    const getBadges = await fetch(`${window.cors}https://api.ffzap.com/v1/supporters`);
    return (await getBadges.json()).filter((b) => b.id != 'undefined');
}

export const helpers = {
    26964566: 'FFZ:AP Developer', // Lordmau5
    11819690: 'FFZ:AP Helper', // Jugachi
    36442149: 'FFZ:AP Helper', // mieDax
    29519423: 'FFZ:AP Helper', // Quanto
    22025290: 'FFZ:AP Helper', // trihex
    4867723: 'FFZ:AP Helper', // Wolsk
};
