// https://github.com/evertton/cookiejs
(function (f) {
    var a = function (b, c, d) {
        return 1 === arguments.length ? a.get(b) : a.set(b, c, d)
    };
    a._document = document;
    a._navigator = navigator;
    a.defaults = {path: "/"};
    a.get = function (b) {
        a._cachedDocumentCookie !== a._document.cookie && a._renewCache();
        return a._cache[b]
    };
    a.set = function (b, c, d) {
        d = a._getExtendedOptions(d);
        a._document.cookie = a._generateCookieString(b, c, d);
        return a
    };
    a._getExtendedOptions = function (b) {
        return{path: b && b.path || a.defaults.path, domain: b && b.domain || a.defaults.domain, secure: b && b.secure !== f ? b.secure :
            a.defaults.secure}
    };
    a._isValidDate = function (a) {
        return"[object Date]" === Object.prototype.toString.call(a) && !isNaN(a.getTime())
    };
    a._generateCookieString = function (a, c, d) {
        a = encodeURIComponent(a);
        c = (c + "").replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
        d = d || {};
        a = a + "=" + c + (d.path ? ";path=" + d.path : "");
        a += d.domain ? ";domain=" + d.domain : "";
        return a += d.secure ? ";secure" : ""
    };
    a._getCookieObjectFromString = function (b) {
        var c = {};
        b = b ? b.split("; ") : [];
        for (var d = 0; d < b.length; d++) {
            var e = a._getKeyValuePairFromCookieString(b[d]);
            c[e.key] === f && (c[e.key] = e.value)
        }
        return c
    };
    a._getKeyValuePairFromCookieString = function (a) {
        var c = a.indexOf("="), c = 0 > c ? a.length : c;
        return{key: decodeURIComponent(a.substr(0, c)), value: decodeURIComponent(a.substr(c + 1))}
    };
    a._renewCache = function () {
        a._cache = a._getCookieObjectFromString(a._document.cookie);
        a._cachedDocumentCookie = a._document.cookie
    };
    a._areEnabled = function () {
        return a._navigator.cookieEnabled || "1" === a.set("cookies.js", 1).get("cookies.js")
    };
    a.enabled = a._areEnabled();
    "function" === typeof define &&
    define.amd ? define(function () {
        return a
    }) : "undefined" !== typeof exports ? ("undefined" !== typeof module && module.exports && (exports = module.exports = a), exports.Cookies = a) : a;
    Retreaver.Base.Cookies = a;
})();