export async function getBadges() {
	const getBadges = await fetch(`${window.cors}https://api.betterttv.net/3/cached/badges/twitch`);
	return await getBadges.json();
}

export function getProBadge(twitchId) {
	return new Promise((resolve) => {
		let done = false;
		const uid = String(twitchId);
		const ws = new WebSocket('wss://sockets.betterttv.net/ws');

		const finish = (data) => {
			if (done) return;
			done = true;

			try {
				ws.send(
					JSON.stringify({
						name: 'part_channel',
						data: { name: `twitch:${uid}` }
					})
				);
			} catch {}

			try {
				ws.close();
			} catch {}
			resolve(data);
		};

		const timeout = setTimeout(() => finish(null), 2500);

		ws.onopen = () => {
			ws.send(
				JSON.stringify({
					name: 'join_channel',
					data: { name: `twitch:${uid}` }
				})
			);

			ws.send(
				JSON.stringify({
					name: 'broadcast_me',
					data: {
						provider: 'twitch',
						providerId: uid,
						channel: `twitch:${uid}`
					}
				})
			);
		};

		ws.onmessage = (e) => {
			try {
				const j = JSON.parse(e.data);

				if (j.name === 'lookup_user' && String(j.data?.providerId) === uid) {
					clearTimeout(timeout);

					if (j.data?.pro && j.data?.badge?.url) {
						return finish({
							url: j.data.badge.url,
							startedAt: j.data.badge.startedAt
						});
					}

					return finish(null);
				}
			} catch {}
		};

		ws.onerror = () => finish(null);
		ws.onclose = () => finish(null);
	});
}
