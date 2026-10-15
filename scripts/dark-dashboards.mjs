// Writes the dark mode dashboards (<name>-dark.svg) next to the light ones, by recolouring the
// light art's neutrals with the platform's dark palette. Brand colours, title bars and photos are
// kept. Rerun after changing a light dashboard:  node scripts/dark-dashboards.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Dark palettes of src/lib/platforms.ts (keep in sync)
const PALETTES = {
	centra: {
		pageBg: '#06201d',
		surface: '#0c2f2b',
		border: '#1a4a44',
		heading: '#e7f4f1',
		text: '#bdd6cf',
		muted: '#85a79f',
		brand: '#0aa898'
	},
	xpdite: {
		pageBg: '#0a1626',
		surface: '#0f2138',
		border: '#1d3758',
		heading: '#e8eefa',
		text: '#bfcbe3',
		muted: '#8899bb',
		brand: '#529de3'
	},
	polymer: {
		pageBg: '#051411',
		surface: '#0a211d',
		border: '#17372f',
		heading: '#e5eeeb',
		text: '#b9c9c4',
		muted: '#83958f',
		brand: '#2aac98'
	}
};

const FILES = [
	['centra', 'src/assets/dashboards/centra.svg'],
	['xpdite', 'src/assets/dashboards/xpdite.svg'],
	['polymer', 'src/assets/dashboards/polymer.svg'],
	['centra', 'public/platform-dashboards/uncut/centra-uncut.svg'],
	['xpdite', 'public/platform-dashboards/uncut/xpdite-uncut.svg'],
	['polymer', 'public/platform-dashboards/uncut/polymer-uncut.svg']
];

const toRgb = hex => {
	const h = hex.length === 4 ? [...hex.slice(1)].map(c => c + c).join('') : hex.slice(1);
	return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
};

// a blended toward b by t
const mix = (a, b, t) =>
	'#' +
	toRgb(a)
		.map((c, i) => Math.round(c + (toRgb(b)[i] - c) * t).toString(16).padStart(2, '0'))
		.join('');

// Light colour -> dark colour, per palette
const colourMap = p => ({
	// Page and panels
	'#f2f9fc': p.pageBg,
	'#f9fafb': mix(p.surface, p.heading, 0.04),
	'#f4f6f8': mix(p.surface, p.heading, 0.05),
	'#f0f2f5': mix(p.surface, p.heading, 0.06),
	'#f6f6f6': mix(p.surface, p.heading, 0.05),
	// Borders, dividers and graph lines
	'#dfe2e8': p.border,
	'#d7dadf': p.border,
	'#d1d5db': p.border,
	'#e5e7eb': p.border,
	'#d9d9d9': p.border,
	'#c8cccf': mix(p.border, p.muted, 0.35),
	'#aac6c3': mix(p.border, p.muted, 0.35),
	'#b9c3cf': mix(p.border, p.muted, 0.45),
	'#e0edff': mix(p.border, p.brand, 0.2),
	// Text
	'#373737': p.heading,
	'#222': p.heading,
	'#222222': p.heading,
	'#2b2b2b': p.heading,
	'#151a20': p.heading,
	'#011b18': p.heading,
	'#1b2a30': p.heading,
	'#05223e': p.heading,
	'#4f5258': p.text,
	'#555': p.text,
	'#555555': p.text,
	'#33464e': p.text,
	'#556973': p.muted,
	'#7d7d7d': p.muted,
	'#9ca3af': p.muted,
	// Polymer's deep green text and icon tiles
	'#01584f': p.brand,
	// Tinted badges
	'#e8f8f7': mix(p.surface, p.brand, 0.18),
	'#e8f5f0': mix(p.surface, p.brand, 0.18),
	'#fff9e6': mix(p.surface, '#e79600', 0.18)
});

// White is a card when it fills a box, and stays white when it is text or an icon drawn on a
// brand colour (a path with curves)
const recolourWhite = (svg, surface) =>
	svg.replace(/<(rect|path)\b([^>]*?)\bfill="#fff(?:fff)?"([^>]*)>/gi, (tag, name, before, after) => {
		if (name.toLowerCase() === 'path') {
			const d = /\bd="([^"]*)"/.exec(before + after)?.[1] ?? '';
			// Glyphs have curves or several outlines (Polymer's straight-edged Runtime arrows)
			const subpaths = d.match(/m/gi)?.length ?? 0;
			if ((/[acqst]/i.test(d) && d.length > 150) || subpaths > 1) {
				return tag;
			}
		}
		return `<${name}${before}fill="${surface}"${after}>`;
	});

// Deep brand colours that fill title bars and buttons and also draw text: only the text and
// icons (long glyph paths) are lightened, so the bars and buttons keep their colour
const recolourText = (svg, p) => {
	const text = { '#072d29': p.heading, '#03463f': p.brand, '#0f62b0': p.brand };
	return svg.replace(
		/<path\b([^>]*?)\bfill="(#072d29|#03463f|#0f62b0)"([^>]*)>/gi,
		(tag, before, colour, after) => {
			const d = /\bd="([^"]*)"/.exec(before + after)?.[1] ?? '';
			return d.length > 120
				? `<path${before}fill="${text[colour.toLowerCase()]}"${after}>`
				: tag;
		}
	);
};

for (const [platform, file] of FILES) {
	const palette = PALETTES[platform];
	const map = colourMap(palette);
	let svg = readFileSync(join(root, file), 'utf8');

	// Masks and clip paths are luminance or shape only: leave their white alone
	const defs = [];
	svg = svg.replace(/<(mask|clipPath)\b[\s\S]*?<\/\1>/g, block => {
		defs.push(block);
		return `\u0000${defs.length - 1}\u0000`;
	});

	svg = recolourWhite(svg, palette.surface);
	svg = recolourText(svg, palette);
	svg = svg.replace(
		/\b(fill|stroke|stop-color)="(#[0-9a-f]{3,6})"/gi,
		(attr, name, colour) => {
			const dark = map[colour.toLowerCase()];
			return dark ? `${name}="${dark}"` : attr;
		}
	);
	svg = svg.replace(/\u0000(\d+)\u0000/g, (_, index) => defs[Number(index)]);

	const out = file.replace(/\.svg$/, '-dark.svg');
	writeFileSync(join(root, out), svg);
	console.log(`wrote ${out}`);
}
