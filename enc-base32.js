;(function (root, factory) {
    if (typeof exports === "object") {
        // CommonJS
        module.exports = exports = factory(require("./core"));
    } else if (typeof define === "function" && define.amd) {
        // AMD
        define(["./core"], factory);
    } else {
        // Global (browser)
        factory(root.CryptoJS);
    }
}(this, function (CryptoJS) {

    (function () {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var C_enc = C.enc;

        /**
         * Base32 encoding strategy.
         */
        var Base32 = C_enc.Base32 = {
            /**
             * Converts a word array to a Base32 string.
             *
             * @param {WordArray} wordArray The word array.
             * @param {string} alphabet 32位字母表
             *
             * @return {string} The Base32 string.
             *
             * @static
             *
             * @example
             *
             *     var base32String = CryptoJS.enc.Base32.stringify(wordArray);
             */
            stringify: function (wordArray, alphabet = '') {
                // Shortcuts
                var words = wordArray.words;
                var sigBytes = wordArray.sigBytes;
                var map = alphabet || this._map;

                // Clamp excess bits
                wordArray.clamp();

                // Convert
                var base32Chars = [];

                var shift = 3;
                var carry = 0;
                var symbol;

                function getByte(idx) {
                    if (idx >= sigBytes) return 0;
                    return (words[idx >>> 2] >>> (24 - ((idx & 0b11) << 3))) & 0xff;
                }

                for (var i = 0; i < sigBytes; i++) {
                    var byte = getByte(i);

                    // 1: 00000 000
                    // 2:          00 00000 0
                    // 3:                    0000 0000
                    // 4:                             0 00000 00
                    // 5:                                       000 00000
                    // 6:                                                00000 000
                    // 7:                                                         00 00000 0

                    symbol = carry | (byte >>> shift);
                    base32Chars.push(map.charAt(symbol & 0x1f));

                    if (shift > 5) {
                        shift -= 5;
                        symbol = byte >>> shift;
                        base32Chars.push(map.charAt(symbol & 0x1f));
                    }

                    shift = 5 - shift;
                    carry = byte << shift;
                    shift = 8 - shift;
                }

                if (shift !== 3) {
                    base32Chars.push(map.charAt(carry & 0x1f));

                    shift = 3;
                    carry = 0;
                }

                // Add padding
                var paddingChar = map.charAt(32);
                if (paddingChar) {
                    while (base32Chars.length % 8) {
                        base32Chars.push(paddingChar);
                    }
                }

                return base32Chars.join('');
            },

            /**
             * Converts a Base32 string to a word array.
             *
             * @param {string} base32Str The Base32 string.
             * @param {string} alphabet 32位字母表
             * @return {WordArray} The word array.
             *
             * @static
             *
             * @example
             *
             *     var wordArray = CryptoJS.enc.Base32.parse(base32String);
             */
            parse: function (base32Str, alphabet = '') {
                // Shortcuts
                var base32StrLength = base32Str.length;
                var map = alphabet || this._map;
                if (alphabet) this._reverseMap = null;
                var reverseMap = this._reverseMap;

                if (!reverseMap) {
                    reverseMap = this._reverseMap = [];
                    for (var j = 0; j < map.length; j++) {
                        reverseMap[map.charCodeAt(j)] = j & 0x1f;
                    }
                }

                // Ignore padding
                var paddingChar = map.charAt(32);
                if (paddingChar) {
                    var paddingIndex = base32Str.indexOf(paddingChar);
                    if (paddingIndex !== -1) {
                        base32StrLength = paddingIndex;
                    }
                }

                // Convert
                return parseLoop(base32Str, base32StrLength, reverseMap);

            },

            _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567='
        };

        function parseLoop(base32Str, base32StrLength, reverseMap) {
            var words = [];
            var nBytes = 0;
            for (var i = 0; i < base32StrLength; i += 8) {
                // 5 + 3
                if (i >= base32StrLength - 0) break;
                var bits1 = reverseMap[base32Str.charCodeAt(i)] << 3;
                var bits2 = reverseMap[base32Str.charCodeAt(i + 1)] >>> 2;
                var bits3 = 0;
                var bitsCombined = bits1 | bits2 | bits3;
                words[nBytes >>> 2] |= bitsCombined << (24 - (nBytes & 0b11) * 8);
                nBytes++;

                // 2 + 5 + 1
                if (i >= base32StrLength - 1) break;
                bits1 = (reverseMap[base32Str.charCodeAt(i + 1)] & 0b11) << 6;
                bits2 = reverseMap[base32Str.charCodeAt(i + 2)] << 1;
                bits3 = reverseMap[base32Str.charCodeAt(i + 3)] >>> 4;
                bitsCombined = bits1 | bits2 | bits3;
                words[nBytes >>> 2] |= bitsCombined << (24 - (nBytes & 0b11) * 8);
                nBytes++;

                // 4 + 4
                if (i >= base32StrLength - 3) break;
                bits1 = (reverseMap[base32Str.charCodeAt(i + 3)] & 0b1111) << 4;
                bits2 = reverseMap[base32Str.charCodeAt(i + 4)] >>> 1;
                bits3 = 0;
                bitsCombined = bits1 | bits2 | bits3;
                words[nBytes >>> 2] |= bitsCombined << (24 - (nBytes & 0b11) * 8);
                nBytes++;

                // 1 + 5 + 2
                if (i >= base32StrLength - 4) break;
                bits1 = (reverseMap[base32Str.charCodeAt(i + 4)] & 0b1) << 7;
                bits2 = reverseMap[base32Str.charCodeAt(i + 5)] << 2;
                bits3 = reverseMap[base32Str.charCodeAt(i + 6)] >>> 3;
                bitsCombined = bits1 | bits2 | bits3;
                words[nBytes >>> 2] |= bitsCombined << (24 - (nBytes & 0b11) * 8);
                nBytes++;

                // 3 + 5
                if (i >= base32StrLength - 6) break;
                bits1 = (reverseMap[base32Str.charCodeAt(i + 6)] & 0b111) << 5;
                bits2 = reverseMap[base32Str.charCodeAt(i + 7)];
                bits3 = 0;
                bitsCombined = bits1 | bits2 | bits3;
                words[nBytes >>> 2] |= bitsCombined << (24 - (nBytes & 0b11) * 8);
                nBytes++;
            }
            nBytes = (base32StrLength * 5) >>> 3
            return WordArray.create(words, nBytes);
        }
    }());

    return CryptoJS.enc.Base32;

}));
