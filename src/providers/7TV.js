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

const fullPaintQueryFields = /* GraphQL */`{
	id
	name
	description
	data {
		layers {
			id
			ty {
				... on PaintLayerTypeImage {
					__typename
					images {
						__typename
						url
						mime
						size
						scale
						width
						height
						frameCount
					}
				}
				... on PaintLayerTypeRadialGradient {
					__typename
					repeating
					shape
					stops {
						at
						color {
							__typename
							hex
							r
							g
							b
							a
						}
					}
				}
				... on PaintLayerTypeLinearGradient {
					__typename
					angle
					repeating
					stops {
						__typename
						at
						color {
							__typename
							hex
							r
							g
							b
							a
						}
					}
				}
				... on PaintLayerTypeSingleColor {
					__typename
					color {
						__typename
						hex
						r
						g
						b
						a
					}
				}
			}
			opacity
		}
		shadows {
			__typename
			offsetX
			offsetY
			blur
			color {
				__typename
				hex
				r
				g
				b
				a
			}
		}
	}
}`;

const fullBadgeQueryFields = /* GraphQL */`{
	id
	name
	description
}`;

const fullCosmeticsQuery = /* GraphQL */`{ 
	paints { paints ${fullPaintQueryFields} } 
	badges { badges ${fullBadgeQueryFields} } 
}`

const fullUserQuery = (id) => /* GraphQL */`{ 
	users {
		userByConnection(platform: TWITCH, platformId: "${id}") {
			id
			style {
				activePaint { id name }
				activeBadge { id name }
			}
      inventory {
          paints {
              to {
                paint {
                    name
                    id
                }
              }
          }
          badges {
              to {
                badge {
                    name
                    id
                }
              }
          }
      }
		}
	}
}`

// Remove newlines and extra spaces
const cleanQuery = (query) => {
	return query.replace(/\\n/g, '').replace(/\s+/g, ' '); 
}

const requestGql = async ({
	query,
	variables = {},
	operationName,
}) => {
	let retryCount = 0;
	while (retryCount <= 5) {
		const response = await fetch('https://7tv.io/v4/gql', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({ operationName, variables, query: cleanQuery(query) }),
		});
	
		if (!response.ok) {
			return undefined;
		}
	
		const data = await response.json();
		if (data.errors || data.message) {
			if (retryCount === 5) {
				console.error('Error fetching user 7TV cosmetics:', userCosmeticsData.errors || userCosmeticsData.message);

				return undefined;
			}
	
			await new Promise((r) => setTimeout(r, 500));
			retryCount++;
		}

		return data;
	}
}

export const getUserCosmetics = async (twitchId) => {
	const userData = await requestGql({ query: fullUserQuery(twitchId) })
	if (!userData?.data?.users?.userByConnection) {
		return {
			paints: [],
			badges: [],
		}
	}
	const data = userData.data.users.userByConnection;
	
	const activePaintId = data.style?.activePaint?.id;
	const paints = [];
	for (const paint of data.inventory.paints ?? []) {
		if (paint.to.paint.id === activePaintId) {
			paint.to.paint.selected = true;
		}
		paints.push(paint.to.paint);
	}
	
	const activeBadgeId = data.style?.activeBadge?.id;
	const badges = [];
	for (const badge of data.inventory?.badges ?? []) {
		if (badge.to.badge.id === activeBadgeId) {
			badge.to.badge.selected = true;
		}
		badges.push(badge.to.badge);
	}

	return { paints, badges };
}

export const getCosmetics = async () => {
	const cosmeticsData = await requestGql({ query: fullCosmeticsQuery });

	return {
		paints: cosmeticsData?.data?.paints?.paints ?? [],
		badges: cosmeticsData?.data?.badges?.badges?.filter((b) => !removedBadges.includes(b.id)) ?? [],
	};
};

const computeLinearGradientLayer = (layer, opacity) => {
  if (layer.stops.length === 0) {
    return undefined;
  }

  const prefix = layer.repeating ? 'repeating-' : '';
  const stops = layer.stops.map((stop) => `${stop.color.hex} ${stop.at * 100}%`).join(', ');
  const gradient = `${prefix}linear-gradient(${layer.angle}deg, ${stops})`;
  return {
    opacity,
    image: gradient,
  };
};

const computeRadialGradientLayer = (layer, opacity) => {
  if (layer.stops.length === 0) {
    return undefined;
  }

  const prefix = layer.repeating ? 'repeating-' : '';
  const shape = layer.shape === 'CIRCLE' ? 'circle' : 'ellipse';
  const stops = layer.stops.map((stop) => `${stop.color.hex} ${stop.at * 100}%`).join(', ');
  const gradient = `${prefix}radial-gradient(${shape}, ${stops})`;
  return {
    opacity,
    image: gradient,
  };
};

const computeImageLayer = (layer, opacity) => {
	const isAnimated = layer.images.some((img) => img.frameCount > 1);
	const img = layer.images.find(
		(i) => i.scale === 1 && (isAnimated ? i.frameCount > 1 : true),
	);

	if (!img) {
		return undefined;
	}

	return {
		opacity,
		image: `url("${img.url}")`,
	};
};


const computeSingleColorLayer = (layer, opacity) => {
  return {
    opacity,
    color: layer.color.hex,
  };
};

const computeDropShadows = (shadows) => {
  if (shadows.length === 0) {
    return undefined;
  }

  return shadows
    .map((s) => `drop-shadow(${s.color.hex} ${s.offsetX}px ${s.offsetY}px ${s.blur}px)`)
    .join(' ');
};

export const computePaintStyle = (paint) => {
  const layers = paint.data.layers.map((layer) => {
    switch (layer.ty.__typename) {
      case 'PaintLayerTypeLinearGradient':
        return computeLinearGradientLayer(layer.ty, layer.opacity);
      case 'PaintLayerTypeRadialGradient':
        return computeRadialGradientLayer(layer.ty, layer.opacity);
      case 'PaintLayerTypeImage':
        return computeImageLayer(layer.ty, layer.opacity);
      case 'PaintLayerTypeSingleColor':
        return computeSingleColorLayer(layer.ty, layer.opacity);
      default:
        return undefined;
    }
  }).filter((l) => l !== undefined);

  const styleParts = [];

  const backgroundImages = layers.flatMap((l) => l.image ? [l.image] : []);
  const backgroundColors = layers.flatMap((l) => l.color ? [l.color] : []);
  const background = [...backgroundColors, ...backgroundImages].join(', ');
  if (background.trim().length > 0) {
    styleParts.push(`background: ${background};`);
  }

  styleParts.push(
    `-webkit-background-clip: text;`,
    `background-clip: text;`,
    `background-size: cover;`,
    `background-position: center;`,
    `color: transparent;`,
  );

  const filter = computeDropShadows(paint.data.shadows);
  if (filter !== undefined) {
    styleParts.push(`filter: ${filter};`);
  }

  const opacities = layers.map((l) => l.opacity).filter((o) => o < 1);
  if (opacities.length > 0) {
    styleParts.push(`opacity: ${Math.min(...opacities)};`);
  }

  return styleParts.join(' ');
};
