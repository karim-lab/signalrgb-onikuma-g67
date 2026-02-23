/**
 * Onikuma G67 - SignalRGB Plugin
 * Direct HID, no OpenRGB needed.
 * VID: 0x0C45  PID: 0x8043  Interface: 2
 */

export function Name()       { return "Onikuma G67"; }
export function Publisher()  { return "Community"; }
export function Version()    { return "1.0.2"; }
export function Type()       { return "Hid"; }
export function ProductId()  { return 0x8043; }
export function VendorId()   { return 0x0C45; }
export function DeviceType() { return "keyboard"; }
export function Size()       { return [17, 5]; }
export function DefaultPosition() { return [10, 100]; }
export function DefaultScale()    { return 8.0; }
export function ImageUrl()   { return "https://raw.githubusercontent.com/karim-lab/signalrgb-onikuma-g67/main/onikuma-g67.png"; }

export function Validate(endpoint) {
	return endpoint.interface === 2;
}

// -----------------------------------------------------------------
// LED Layout - confirmed by hardware testing
// -----------------------------------------------------------------
const vKeyNames = [
	"ESC",
	"1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "Minus", "Equals", "Backspace",
	"Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "LBracket", "RBracket",
	"CapsLock", "A", "S", "D", "F", "G", "H", "J", "K", "L", "Semicolon", "Quote", "Backslash", "Enter",
	"LShift", "Z", "X", "C", "V", "B", "N", "M", "Comma", "Period", "Slash", "RShift", "Up",
	"LCtrl", "LWin", "LAlt", "Space", "RAlt", "Fn", "Left", "Down", "Right",
	"Home", "PageUp", "End", "PageDown"
];

const vKeys = [
	0,
	17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 92,
	32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44,
	48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 76,
	64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 90,
	80, 81, 82, 83, 84, 85, 88, 89, 91,
	104, 105, 107, 108
];

const vKeyPositions = [
	[0, 0],
	[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [14, 0],
	[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1], [11, 1], [12, 1],
	[0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [11, 2], [13, 2], [14, 2],
	[0, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [11, 3], [12, 3], [14, 3],
	[0, 4], [1, 4], [2, 4], [6, 4], [10, 4], [11, 4], [12, 4], [13, 4], [14, 4],
	[16, 1], [16, 2], [16, 3], [16, 4]
];

// Pre-computed: which chunks (base indices) actually contain our keys
// Chunks: 0,14,28,42,56,70,84,98 — all 8 need to be sent
const ACTIVE_CHUNKS = [0, 14, 28, 42, 56, 70, 84, 98];

// Pre-build a Set for fast lookup
const vKeySet = new Set(vKeys);

export function LedNames()     { return vKeyNames; }
export function LedPositions() { return vKeyPositions; }

// -----------------------------------------------------------------
// Dirty tracking — only send chunks that changed
// -----------------------------------------------------------------
let lastMap = new Array(128).fill(null).map(() => [-1, -1, -1]);

export function Initialize() {
	const packet = [
		0x00, 0xAA, 0x23, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x05, 0x03, 0x00, 0x00, 0x00, 0xAA, 0x55
	];
	while (packet.length < 65) packet.push(0x00);
	device.write(packet, 65);
	device.pause(50);
}

export function Render() {
	sendColors();
}

export function Shutdown() {
	const map = new Array(128).fill(null).map(() => [0, 0, 0]);
	pushToKeyboard(map, true);
}

function sendColors() {
	const map = new Array(128).fill(null).map(() => [0, 0, 0]);
	for (let i = 0; i < vKeys.length; i++) {
		const [x, y] = vKeyPositions[i];
		const color = device.color(x, y);
		map[vKeys[i]] = [color[0], color[1], color[2]];
	}
	pushToKeyboard(map, false);
}

function pushToKeyboard(map, force) {
	const CHUNK = 14;

	for (const base of ACTIVE_CHUNKS) {
		// Check if anything in this chunk changed
		let changed = force;
		if (!changed) {
			for (let offset = 0; offset < CHUNK; offset++) {
				const idx = base + offset;
				if (idx < 128 && vKeySet.has(idx)) {
					const [r, g, b] = map[idx];
					const [lr, lg, lb] = lastMap[idx];
					if (r !== lr || g !== lg || b !== lb) { changed = true; break; }
				}
			}
		}
		if (!changed) continue;

		const address  = base * 4;
		const lowByte  = address & 0xFF;
		const highByte = (address >> 8) & 0xFF;

		const packet = [0x00, 0xAA, 0x24, 0x38, lowByte, highByte, 0x00, 0x00, 0x00];

		for (let offset = 0; offset < CHUNK; offset++) {
			const keyIdx = base + offset;
			const [r, g, b] = (keyIdx < 128 && map[keyIdx]) ? map[keyIdx] : [0, 0, 0];
			packet.push(keyIdx, r, g, b);
			if (keyIdx < 128) lastMap[keyIdx] = [r, g, b];
		}

		while (packet.length < 65) packet.push(0x00);
		device.write(packet, 65);
	}
}
