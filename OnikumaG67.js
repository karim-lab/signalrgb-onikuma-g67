/**
 * Onikuma G67 - SignalRGB Plugin
 * Direct HID communication, no OpenRGB needed.
 * Protocol reverse-engineered via USB sniffing.
 *
 * VID: 0x0C45  PID: 0x8043  Interface: 2
 *
 * Full key map confirmed by hardware testing.
 */

export function Name()       { return "Onikuma G67"; }
export function Publisher()  { return "Community"; }
export function Version()    { return "1.0.0"; }
export function Type()       { return "Hid"; }
export function ProductId()  { return [0x8043]; }
export function VendorId()   { return [0x0C45]; }
export function DeviceType() { return "keyboard"; }
export function Endpoint()   { return { "usage": 0x0061, "usage_page": 0xff68 }; }

// -----------------------------------------------------------------
// LED Layout
// col/row = physical grid position for effect mapping
// idx     = hardware memory index (confirmed by hardware test)
// -----------------------------------------------------------------
const LEDS = [
  // ESC
  { name: "ESC",        idx: 0,   col: 0,  row: 0 },

  // Number Row (no backtick on this layout)
  { name: "1",          idx: 17,  col: 1,  row: 0 },
  { name: "2",          idx: 18,  col: 2,  row: 0 },
  { name: "3",          idx: 19,  col: 3,  row: 0 },
  { name: "4",          idx: 20,  col: 4,  row: 0 },
  { name: "5",          idx: 21,  col: 5,  row: 0 },
  { name: "6",          idx: 22,  col: 6,  row: 0 },
  { name: "7",          idx: 23,  col: 7,  row: 0 },
  { name: "8",          idx: 24,  col: 8,  row: 0 },
  { name: "9",          idx: 25,  col: 9,  row: 0 },
  { name: "0",          idx: 26,  col: 10, row: 0 },
  { name: "Minus",      idx: 27,  col: 11, row: 0 },
  { name: "Equals",     idx: 28,  col: 12, row: 0 },
  { name: "Backspace",  idx: 92,  col: 14, row: 0 },

  // QWERTY Row
  { name: "Tab",        idx: 32,  col: 0,  row: 1 },
  { name: "Q",          idx: 33,  col: 1,  row: 1 },
  { name: "W",          idx: 34,  col: 2,  row: 1 },
  { name: "E",          idx: 35,  col: 3,  row: 1 },
  { name: "R",          idx: 36,  col: 4,  row: 1 },
  { name: "T",          idx: 37,  col: 5,  row: 1 },
  { name: "Y",          idx: 38,  col: 6,  row: 1 },
  { name: "U",          idx: 39,  col: 7,  row: 1 },
  { name: "I",          idx: 40,  col: 8,  row: 1 },
  { name: "O",          idx: 41,  col: 9,  row: 1 },
  { name: "P",          idx: 42,  col: 10, row: 1 },
  { name: "LBracket",   idx: 43,  col: 11, row: 1 },
  { name: "RBracket",   idx: 44,  col: 12, row: 1 },

  // ASDF Row
  { name: "CapsLock",   idx: 48,  col: 0,  row: 2 },
  { name: "A",          idx: 49,  col: 1,  row: 2 },
  { name: "S",          idx: 50,  col: 2,  row: 2 },
  { name: "D",          idx: 51,  col: 3,  row: 2 },
  { name: "F",          idx: 52,  col: 4,  row: 2 },
  { name: "G",          idx: 53,  col: 5,  row: 2 },
  { name: "H",          idx: 54,  col: 6,  row: 2 },
  { name: "J",          idx: 55,  col: 7,  row: 2 },
  { name: "K",          idx: 56,  col: 8,  row: 2 },
  { name: "L",          idx: 57,  col: 9,  row: 2 },
  { name: "Semicolon",  idx: 58,  col: 10, row: 2 },
  { name: "Quote",      idx: 59,  col: 11, row: 2 },
  { name: "Backslash",  idx: 60,  col: 13, row: 2 },
  { name: "Enter",      idx: 76,  col: 14, row: 2 },

  // ZXCV Row
  { name: "LShift",     idx: 64,  col: 0,  row: 3 },
  { name: "Z",          idx: 65,  col: 2,  row: 3 },
  { name: "X",          idx: 66,  col: 3,  row: 3 },
  { name: "C",          idx: 67,  col: 4,  row: 3 },
  { name: "V",          idx: 68,  col: 5,  row: 3 },
  { name: "B",          idx: 69,  col: 6,  row: 3 },
  { name: "N",          idx: 70,  col: 7,  row: 3 },
  { name: "M",          idx: 71,  col: 8,  row: 3 },
  { name: "Comma",      idx: 72,  col: 9,  row: 3 },
  { name: "Period",     idx: 73,  col: 10, row: 3 },
  { name: "Slash",      idx: 74,  col: 11, row: 3 },
  { name: "RShift",     idx: 75,  col: 12, row: 3 },
  { name: "Up",         idx: 90,  col: 14, row: 3 },

  // Bottom Row
  { name: "LCtrl",      idx: 80,  col: 0,  row: 4 },
  { name: "LWin",       idx: 81,  col: 1,  row: 4 },
  { name: "LAlt",       idx: 82,  col: 2,  row: 4 },
  { name: "Space",      idx: 83,  col: 6,  row: 4 },
  { name: "RAlt",       idx: 84,  col: 10, row: 4 },
  { name: "Fn",         idx: 85,  col: 11, row: 4 },
  { name: "Left",       idx: 88,  col: 12, row: 4 },
  { name: "Down",       idx: 89,  col: 13, row: 4 },
  { name: "Right",      idx: 91,  col: 14, row: 4 },

  // Right Navigation Column
  { name: "Home",       idx: 104, col: 16, row: 1 },
  { name: "PageUp",     idx: 105, col: 16, row: 2 },
  { name: "End",        idx: 107, col: 16, row: 3 },
  { name: "PageDown",   idx: 108, col: 16, row: 4 },
];

const LED_COUNT = LEDS.length;

// -----------------------------------------------------------------
// Plugin Lifecycle
// -----------------------------------------------------------------

/**
 * Called by SignalRGB to verify this is the correct device.
 * Must return true for the plugin to initialize.
 */
export function Validate(device) {
  return device.idVendor === 0x0C45 && device.idProduct === 0x8043;
}

/**
 * Called once on plugin load.
 * Switches keyboard into per-key custom RGB mode (0x80 flag).
 */
export function Initialize() {
  const packet = [
    0xAA, 0x23, 0x38, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x05, 0x03, 0x00, 0x00, 0x00, 0xAA, 0x55,
  ];
  while (packet.length < 64) packet.push(0x00);
  device.write(packet);
}

/**
 * Called every frame by SignalRGB.
 * Reads per-LED colors and pushes them to the keyboard in 14-key chunks.
 */
export function Render() {
  // Build sparse map: hardware index → [r, g, b]
  const map = new Array(128).fill(null).map(() => [0, 0, 0]);

  for (let i = 0; i < LED_COUNT; i++) {
    const led = LEDS[i];
    const color = device.color(led.col, led.row);
    map[led.idx] = [color[0], color[1], color[2]];
  }

  // Send in 14-key chunks matching the protocol structure
  const CHUNK = 14;

  for (let base = 0; base < 128; base += CHUNK) {
    const address  = base * 4;
    const lowByte  = address & 0xFF;
    const highByte = (address >> 8) & 0xFF;

    const packet = [0xAA, 0x24, 0x38, lowByte, highByte, 0x00, 0x00, 0x00];

    for (let offset = 0; offset < CHUNK; offset++) {
      const keyIdx = base + offset;
      const [r, g, b] = keyIdx < 128 ? map[keyIdx] : [0, 0, 0];
      packet.push(keyIdx, r, g, b);
    }

    while (packet.length < 64) packet.push(0x00);
    device.write(packet);
  }
}

/**
 * LED name list — SignalRGB uses these for per-key assignments in the UI.
 */
export function LedNames() {
  return LEDS.map(l => l.name);
}

/**
 * LED positions — [col, row] grid coordinates for effect mapping.
 * SignalRGB uses these to correctly apply directional effects (waves, etc).
 */
export function LedPositions() {
  return LEDS.map(l => [l.col, l.row]);
}
