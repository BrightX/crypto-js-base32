# CryptoJS-Base32

[![LICENSE](https://img.shields.io/badge/license-MIT-lightgrey.svg)](https://github.com/BrightX/crypto-js-base32/blob/master/LICENSE.txt)

基于 CryptoJS 的 JavaScript Base32库。

### 依赖

* [CryptoJS](https://github.com/brix/crypto-js) 

### 使用方法

#### HTML 直接使用

```html
<!--<script src="https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js"></script>-->
<script src="https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.js"></script>

<script src="./enc-base32.js"></script>

<script type="text/javascript">
    var src = CryptoJS.enc.Utf8.parse("优秀的亮亮");
    console.log(CryptoJS.enc.Base32.stringify(src));  // 4S6JRZ5HQDTZVBHEXKXOJOVO
    // or
    console.log(src.toString(CryptoJS.enc.Base32));  // 4S6JRZ5HQDTZVBHEXKXOJOVO

    var parsed = CryptoJS.enc.Base32.parse("JBSWY3DPEBBHE2LHNB2CAWDV");
    console.log(parsed.toString(CryptoJS.enc.Utf8));  // Hello Bright Xu
</script>
```

