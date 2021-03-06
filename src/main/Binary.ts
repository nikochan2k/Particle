class Binary {

    _u8: Uint8Array;
    _byteOffset: number;
    _bitOffset: number;

    constructor(data: ArrayBuffer | number) {
        if (typeof data === "number") {
            this._u8 = new Uint8Array(data as number);
        } else {
            this._u8 = new Uint8Array(data as ArrayBuffer);
        }
        this._byteOffset = 0;
        this._bitOffset = 0;
    }

    writeU8(u8: Uint8Array, bitLength: number): void {
        // bitOffset    bitLength              sum shift result             next
        // 1"oxxxxxxx"  7"xooooooo"          = 8   0     oooooooo           0
        // 1"oxxxxxxx"  5"xxxooooo"          = 6   -2    ooooooxx           6
        // 3"oooxxxxx"  7"xooooooo"          = 10  2     oooooooo ooxxxxxx  2
        // 6"ooooooxx"  8"oooooooo"          = 14  6     oooooooo ooooooxx  6
        // 0"xxxxxxxx" 10"xxxxxxoo oooooooo" = 10  -6    oooooooo ooxxxxxx  2
        const sum = this._bitOffset + bitLength;
        const nextBitOffset = sum % 8;
        if (nextBitOffset !== 0) {
            const shift = sum - u8.byteLength * 8;
            if (shift < 0) {
                this._writeU8WithLeftBitShift(u8, -shift);
            } else {
                this._writeU8WithRightBitShift(u8, shift);
            }
        } else {
            this._writeU8WithoutBitShift(u8);
        }
        this._bitOffset = nextBitOffset;
    }

    _writeU8WithLeftBitShift(u8: Uint8Array, left: number): void {
        const right = 8 - left;
        let i = 0;
        let temp = (u8[i++] << left) & 0xFF;
        while (i < u8.length) {
            temp |= (u8[i] >> right);
            this._u8[this._byteOffset++] |= temp;
            temp = (u8[i++] << left) & 0xFF;
        }
        this._u8[this._byteOffset] |= temp;
    }

    _writeU8WithRightBitShift(u8: Uint8Array, right: number): void {
        const left = 8 - right;
        let temp = this._u8[this._byteOffset];
        for (let i = 0; i < u8.length; i++ , this._byteOffset++) {
            this._u8[this._byteOffset] = temp | (u8[i] >> right);
            temp = (u8[i] << left) & 0xFF;
        }
        this._u8[this._byteOffset] = temp;
    }

    _writeU8WithoutBitShift(u8: Uint8Array) {
        let i = 0;
        this._u8[this._byteOffset++] |= u8[i];
        for (i = 1; i < u8.length; i++) {
            this._u8[this._byteOffset++] = u8[i];
        }
    }

    readU8(bitLength: number): Uint8Array {
        //                                                        left          byteLength
        // instance                     bitOffset bitLength total total%8 right Math.ceil(total/8)
        // "xooxxxxx"                   1         2         3     3       5     1
        // "oooooooo"                   0         8         8     0       8     1
        // "xxxooooo oooxxxxx"          3         8         11    3       5     2
        // "xxxxxxxo oooooooo oxxxxxxx" 7         10        17    1       7     3
        // "xxxxxxoo oooooooo ooooooox" 6         17        23    7       1     3
        const total = this._bitOffset + bitLength;
        const left = total % 8;
        const byteLength = Math.ceil(total / 8);
        const u8 = new Uint8Array(byteLength);
        const first = this._u8[this._byteOffset] & (0xFF >> this._bitOffset);
        if (0 < left) {
            this._readU8WithBitShift(first, u8, left);
        } else {
            this._readU8WithoutBitShift(first, u8);
        }
        this._forwardBits(bitLength);
        return u8;
    }

    _readU8WithBitShift(temp: number, u8: Uint8Array, left: number): void {
        const right = 8 - left;
        let i = 0;
        u8[i++] |= temp >> right;
        while (i < u8.byteLength) {
            u8[i] = (temp << left) & 0xFF;
            temp = this._u8[++this._byteOffset];
            u8[i++] |= temp >> right;
        }
    }

    _readU8WithoutBitShift(first: number, u8: Uint8Array): void {
        let i = 0;
        u8[i++] = first;
        while (i < u8.length) {
            u8[i++] = this._u8[++this._byteOffset];
        }
    }

    readBit(): number {
        const right = 7 - this._bitOffset;
        const bit = (this._u8[this._byteOffset] >> right) & 0x1;
        this._forwardBits(1);
        return bit;
    }

    _forwardBits(bitLength: number): void {
        const bitOffset = this._bitOffset + bitLength;
        this._bitOffset = bitOffset % 8;
        if (this._bitOffset === 0) {
            this._byteOffset++;
        }
    }

}

export default Binary;
