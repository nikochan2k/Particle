import Decimal from "../src/Decimal";
import Binary from "../src/Binary";

const decimal = new Decimal(false, 0, 2);

const binary = new Binary(11);
const u8 = binary.u8;
u8[0] = parseInt("00000011", 2);
u8[1] = parseInt("11111111", 2);
u8[2] = parseInt("11000000", 2);
u8[3] = parseInt("00000000", 2);
u8[4] = parseInt("00111111", 2);
u8[5] = parseInt("11111111", 2);
u8[6] = parseInt("11111111", 2);
u8[7] = parseInt("11111111", 2);
u8[8] = parseInt("11111111", 2);
u8[9] = parseInt("11111111", 2);
u8[10] = parseInt("11111110", 2);
const d1 = new Decimal(true, 0, 255);
d1.read(binary);
const d2 = new Decimal(false, -16, 15);
d2.read(binary);
const d3 = new Decimal(true, -1024, 1023);
d3.read(binary);
const d4 = new Decimal(false, -32768, 32767);
d4.read(binary);
const d5 = new Decimal(false, 0, 9007199254740991);
d5.read(binary);
