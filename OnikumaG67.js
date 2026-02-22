/**
 * Onikuma G67 - SignalRGB Plugin
 * Direct HID, no OpenRGB needed.
 * VID: 0x0C45  PID: 0x8043  Interface: 2
 */

export function Name()       { return "Onikuma G67"; }
export function Publisher()  { return "Community"; }
export function Version()    { return "1.0.1"; }
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

// Hardware indices matching each key above
const vKeys = [
	0,                                                          // ESC
	17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 92,       // Number row + Backspace
	32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44,       // QWERTY row
	48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 76,   // ASDF row + Enter
	64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 90,       // ZXCV row + Up
	80, 81, 82, 83, 84, 85, 88, 89, 91,                        // Bottom row + arrows
	104, 105, 107, 108                                          // Nav cluster
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

export function LedNames()     { return vKeyNames; }
export function LedPositions() { return vKeyPositions; }

// -----------------------------------------------------------------
// Plugin Lifecycle
// -----------------------------------------------------------------

export function Initialize() {
	const packet = [
		0x00, 0xAA, 0x23, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x05, 0x03, 0x00, 0x00, 0x00, 0xAA, 0x55
	];
	while (packet.length < 65) packet.push(0x00);
	device.write(packet, 65);
	device.pause(100);
}

export function Render() {
	sendColors();
}

export function Shutdown() {
	// Clear all to black
	const map = new Array(128).fill(null).map(() => [0, 0, 0]);
	pushToKeyboard(map);
}

function sendColors() {
	const map = new Array(128).fill(null).map(() => [0, 0, 0]);

	for (let i = 0; i < vKeys.length; i++) {
		const [x, y] = vKeyPositions[i];
		const color = device.color(x, y);
		map[vKeys[i]] = [color[0], color[1], color[2]];
	}

	pushToKeyboard(map);
}

function pushToKeyboard(map) {
	const CHUNK = 14;

	for (let base = 0; base < 128; base += CHUNK) {
		// Only send chunks that contain at least one of our actual keys
		let hasKey = false;
		for (let offset = 0; offset < CHUNK; offset++) {
			if (vKeys.indexOf(base + offset) !== -1) { hasKey = true; break; }
		}
		if (!hasKey) continue;

		const address  = base * 4;
		const lowByte  = address & 0xFF;
		const highByte = (address >> 8) & 0xFF;

		const packet = [0x00, 0xAA, 0x24, 0x38, lowByte, highByte, 0x00, 0x00, 0x00];

		for (let offset = 0; offset < CHUNK; offset++) {
			const keyIdx = base + offset;
			const [r, g, b] = map[keyIdx] || [0, 0, 0];
			packet.push(keyIdx, r, g, b);
		}

		while (packet.length < 65) packet.push(0x00);
		device.write(packet, 65);
		device.pause(2); // Small pause between packets to avoid flooding HID
	}
}
