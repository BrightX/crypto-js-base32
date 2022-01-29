;(function (root, factory, undef) {
    if (typeof exports === "object") {
        // CommonJS
        module.exports = exports = factory(require("crypto-js/core"), require("./enc-base32"));
    } else if (typeof define === "function" && define.amd) {
        // AMD
        define(["crypto-js/core", "./enc-base32"], factory);
    } else {
        // Global (browser)
        root.CryptoJS = factory(root.CryptoJS);
    }
}(this, function (CryptoJS) {
    return CryptoJS;
}));
