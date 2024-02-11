export async function getBadges() {
	const getBadges = await fetch(`${window.cors}https://tduva.com/res/badges`);
	return (await getBadges.json()).filter((b) => b.id == 'chatty');
}
