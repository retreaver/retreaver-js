(function (context) {
    /**
     * @namespace Retreaver
     */
    var Retreaver = {

        /**
         * Configure the retreaver client library.
         * @function configure
         * @memberof Retreaver
         * @param {Object} options
         * @param {String} options.host - Retreaver API Host
         * @example
         * Retreaver.configure({host: 'api.rtvrapi.com'});
         *
         */
        configure: function (options) {
            var params = {
                addr: options.host,
                http_prefix: 'http',
                urlregex: "/\\/\\/[^\\/]*\\/(.*)/"
            };
            window.Retreaver._connection = new Retreaver.Base.Request(params);
        }
    };
    context.Retreaver = Retreaver;

})(window);
;(function () {
    // ensure namespace is present
    if (typeof window.Retreaver === 'undefined') window.Retreaver = {};
    var Base = {};
    // define helpers
    Base.assert_required_keys = function () {
        var args = Array.prototype.slice.call(arguments);
        var object = args.shift();
        for (var i = 0; i < args.length; i++) {
            var key = args[i];
            if (typeof object === 'undefined' || typeof object[key] === 'undefined') {
                throw  "ArgumentError: Required keys are not defined: " + args.join(', ');
            }
        }
        return object;
    };
    Base.merge = function (obj1, obj2) {
        for (var p in obj2) {
            try {
                if (obj2[p].constructor == Object) {
                    obj1[p] = Base.merge(obj1[p], obj2[p]);
                } else {
                    obj1[p] = obj2[p];
                }
            } catch (e) {
                obj1[p] = obj2[p];
            }
        }
        return obj1;
    };
    Base.isArray = function (arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
    Base.ieVersion = function () {
        if (Base._ieVersion == null) {
            Base._ieVersion = (function () {
                var v = 3,
                    div = document.createElement('div'),
                    all = div.getElementsByTagName('i');

                while (
                    div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
                        all[0]
                    ) {
                }
                return v > 4 ? v : false;
            }());
        }
        if (Base._ieVersion == 6 || Base._ieVersion == 7) {
            if (Retreaver['easyxdm_loaded'] == null) Retreaver['easyxdm_loaded'] = false;
        }
        return Base._ieVersion;
    };
    Retreaver.Base = Base;
})();;// https://github.com/evertton/cookiejs
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
})();;// http://www.webtoolkit.info/javascript-base64.html#.U-qwzYBdUwQ
(function () {
    var Base64 = {
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    };
    // public method for encoding
    Base64.encode = function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) +
                Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);

        }
        return output;
    };
    Base64.decode = function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = Base64._keyStr.indexOf(input.charAt(i++));
            enc2 = Base64._keyStr.indexOf(input.charAt(i++));
            enc3 = Base64._keyStr.indexOf(input.charAt(i++));
            enc4 = Base64._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;
    };
    Base64._utf8_encode = function (string) {
        //REGEX_2: /\r\n/g NEWLINE: "\n"
        string = string.replace(eval("/\\r\\n/g"),eval("String('\\n')"));
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    };
    Base64._utf8_decode = function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }
        return string;
    };
    Retreaver.Base.Base64 = Base64;
})();;(function () {
    // Dependencies
    var Base = Retreaver.Base;
    /**
     * @constructor
     * @memberof Retreaver.Base
     * @param {Object}  config - Configuration hash
     * @param {String}  config.type - The data type
     * @param {Numeric}  config.primary_key - The primary_key
     */
    var Data = function (config) {

        function initialize() {
            Base.assert_required_keys(config, 'type', 'primary_key');
            if (typeof Retreaver.Base.Data._store[config.type] === 'undefined') {
                Retreaver.Base.Data._store[config.type] = {};
            }
            if (typeof Retreaver.Base.Data._store[config.type][config.primary_key] === 'undefined') {
                Retreaver.Base.Data._store[config.type][config.primary_key] = {};
            }
        }

        var self = this;

        /**
         * Request data from the host
         * @memberOf Retreaver.Base.Data
         * @function get
         * @instance
         * @param {String} key - The key to retrieve
         * @returns {*}
         */
        self.get = function () {
            var output = {};
            if (typeof arguments[0] === 'undefined') {
                output = Retreaver.Base.Data._store[config.type][config.primary_key];
            } else if (arguments.length === 1) {
                output = Retreaver.Base.Data._store[config.type][config.primary_key][arguments[0]];
            } else {
                for (var i = 0; i < arguments.length; i++) {
                    var key = arguments[i];
                    output[key] = Retreaver.Base.Data._store[config.type][config.primary_key][key];
                }
            }
            return output;
        };

        /**
         * Request data from the host
         * @memberOf Retreaver.Base.Data
         * @function set
         * @instance
         * @param {String} key - The key to retrieve
         * @param {String} value - The value to assign
         * @returns {*}
         */
        self.set = function (key, value) {
            Retreaver.Base.Data._store[config.type][config.primary_key][key] = value;
            return value;
        };

        /**
         * Merge data
         * @memberOf Retreaver.Base.Data
         * @function set
         * @instance
         * @param {String} object - The object to merge
         * @returns {*}
         */
        self.merge = function (object) {
            for (var key in object) {
                Retreaver.Base.Data._store[config.type][config.primary_key][key] = object[key];
            }
            return object;
        };

        initialize();
    };
    Data._store = {};
    Retreaver.Base.Data = Data;
})();;(function () {
    // Dependencies
    var Base = Retreaver.Base;
    var Data = Retreaver.Base.Data;

    /**
     * @constructor
     * @memberof Retreaver.Base
     */
    var Model = function () {

        this.api_host_uri = '/api/v1/';
        this.type = 'model';

        this.primary_key = function (primary_key) {
            return Model.primary_key(this.type, primary_key);
        };

        this.store = function (data) {
            // do we have data to store?
            if (typeof(data) !== 'undefined') {
                // does the data contain the required primary_key?
                var key = this.primary_key();
                if (typeof(data[key]) === 'undefined') {
                    throw("ArgumentError: Expected to receive primary_key " + key);
                }
                // has a store been initialized?
                else if (typeof(this._store) === 'undefined') {
                    this._store = new Retreaver.Base.Data({type: this.type, primary_key: data[key] });
                }
                // merge the data
                this._store.merge(data);
                // update visitor is token present
                Model.update_visitor_id(data);
            }
            return this._store;
        };

        this.get_data = function (path, callback) {
            return this.connection().getJSON(this.api_host_uri + path, null, [Model.update, callback], this);
        };

        this.post_data = function (path, data, callback) {
            return this.connection().postJSON(this.api_host_uri + path, data, [Model.update, callback], this);
        };

        this.set = function () {
            if (typeof(this["set_" + arguments[0]]) === 'function') {
                arguments[1] = this["set_" + arguments[0]].apply(this, [arguments[1]]);
            }
            return this._store.set.apply(this, arguments);
        };
        this.get = function () {
            return this._store.get.apply(this, arguments);
        };
        this.connection = function () {
            return Retreaver.Base.Request.connection();
        };
    };
    Model.inflections = {
        'number': 'numbers',
        'campaign': 'campaigns'
    };
    Model.update = function (data) {
        for (var key in data) {
            var type = key;
            var value = data[key];
            if (typeof Model.inflections[key] !== 'undefined') {
                type = Model.inflections[key];
            }
            if (typeof Data._store[type] !== 'undefined') {
                if (Base.isArray(value)) {
                    for (var i = 0; i < value.length; i++) {
                        Model.update_record(type, value[i]);
                    }
                } else {
                    Model.update_record(type, value[i]);
                }
            }
        }
        return data;
    };
    Model.update_record = function (type, record) {
        // update visitor is token present
        Model.update_visitor_id(record);
        // update data store
        if (typeof record.id !== 'undefined') {
            var primary_key = Model.primary_key(type);
            for (var key in record) {
                Retreaver.Base.Data._store[type][record[primary_key]][key] = record[key];
            }
            return true
        } else {
            return false
        }
        return record;
    };
    Model.update_visitor_id = function (record) {
        if (typeof(record) !== 'undefined' && typeof(record.visitor_id) !== 'undefined') {
            Retreaver.Base.Cookies.set('CallPixels-vid', record.visitor_id);
        }
    };
    Model.primary_key = function (type, primary_key) {
        if (typeof(Model.primary_keys) === 'undefined') Model.primary_keys = {};
        // default key
        if (typeof(Model.primary_keys[type]) === 'undefined') Model.primary_keys[type] = 'id';
        // assign key if passed
        if (typeof(primary_key) !== 'undefined') Model.primary_keys[type] = primary_key;
        // return value
        return Model.primary_keys[type];
    };
    Retreaver.Base.Model = Model;
})();;(function () {
    // Dependencies
    var Base = window.Retreaver.Base;
    var Cookies = window.Retreaver.Base.Cookies;
    /**
     * @constructor
     * @memberof Retreaver.Base
     * @param {String}  options.http_prefix - The http type (http || https).
     * @param {String}  options.addr - The api hostname.
     * @param {String}  options.urlregex - The url regex validator.
     */
    var Request = function (options) {

        function initialize(options) {
            // assert required keys and assign if valid
            config = Base.assert_required_keys(options, 'http_prefix', 'addr', 'urlregex');
        }

        // INIT
        var self = this;
        var config = {};

        /**
         * Request data from the host
         * @memberOf Retreaver.Base.Request
         * @function getJSON
         * @instance
         * @param {String} request_url - The request uri
         * @param {Object} payload - Post object
         * @param {*} [callbacks] - Array or Function to be called after request
         * @param {*} [context] - Context applied to callback
         * @returns {Object} json
         */
        self.getJSON = function (request_url, payload, callbacks, context) {
            // ensure callbacks are an array
            if (typeof(callbacks) == "function") callbacks = [callbacks];
            if (typeof(context) === 'undefined') context = self;
            // request
            var request = function () {
                self.apiRequest(request_url, function (data) {
                    // parse
                    response = JSON.parse(data);
                    // fire callbacks
                    for (var i in callbacks) {
                        if (typeof callbacks[i] == "function") callbacks[i].apply(context, [response]);
                    }
                }, payload)
            };
            if (Base.ieVersion() == 6 || Base.ieVersion() == 7) {
                with_ie_scripts(request);
            } else {
                request();
            }
        };

        // This is an alias for now to show intent
        self.postJSON = function () {
            return self.getJSON.apply(this, arguments);
        };

        /**
         * Request data from the host
         * @memberOf Retreaver.Base.Request
         * @function apiRequest
         * @instance
         * @param {String} request_url - The request uri
         * @param {Array} callbackFunctions - Array of callback functions
         * @param {Object} payload - Post object
         * @returns {String} string
         */
        self.apiRequest = function (request_uri, callbackFunctions, payload) {
            // configure
            var http_prefix = config['http_prefix'];
            var addr = config['addr'];
            var urlregex = eval(config['urlregex']);
            var request_url = http_prefix + '://' + addr + request_uri;
            // configure

            if (payload && typeof(Cookies.get('CallPixels-vid')) !== 'undefined' && Cookies.get('CallPixels-vid') !== 'null') {
                payload['visitor_id'] = Cookies.get('CallPixels-vid');
            }

            if (typeof(callbackFunctions) == "function") {
                callbackFunctions = [callbackFunctions];
            }

            function ignored() {
            }

            function runCallbacks(response) {
                for (var i in callbackFunctions) {
                    if (typeof callbackFunctions[i] == "function") callbackFunctions[i](response);
                }
            }

            function forwardResponse() {
                runCallbacks(xdr.responseText);
            }

            function sendXdm() {
                // create the rpc request
                var remote = http_prefix + '://' + addr + '/ie_provider';
                var swf = http_prefix + '://' + addr + "/easyxdm.swf";
                var rpc = eval('new window.easyXDM.Rpc({ remote: "' + remote + '", swf: "' + swf + '"},{remote: {request: {}}});');

                rpc['request']({
                    url: ('/' + request_url.match(urlregex)[1]),
                    method: "POST",
                    data: payload
                }, function (response) {
                    runCallbacks(response.data);
                });
            }

            if (window.XDomainRequest) {
                // IE >= 8
                // 1. Create XDR object
                var xdr = new XDomainRequest();

                xdr.onload = forwardResponse; //alertLoaded;
                xdr.onprogress = ignored;
                xdr.onerror = ignored;
                xdr.ontimeout = ignored;
                xdr.timeout = 30000;

                // 2. Open connection with server using GET method
                if (payload) {
                    xdr.open("post", request_url);
                    xdr.send(self.buildPost(payload));
                } else {
                    xdr.open("get", request_url);
                    xdr.send();
                }

                // 3. Send string data to server

            } else if (Base.ieVersion() == 6 || Base.ieVersion() == 7) {
                with_ie_scripts(sendXdm);
            } else {
                var request = new XMLHttpRequest;

                if (payload) {
                    request.open("POST", request_url, false);
                    request.setRequestHeader("Content-Type", "application/json");
                    request.send(JSON.stringify(payload));
                } else {
                    request.open("GET", request_url, false);
                    request.send();
                }

                runCallbacks(request.responseText);
            }
        };

        function with_ie_scripts(callback) {
            if (Retreaver['easyxdm_loaded']) {
                callback();
            } else {
                self.loadScript(http_prefix + '://cdn.jsdelivr.net/easyxdm/2.4.17.1/easyXDM.min.js', function () {
                    self.loadScript(http_prefix + '://cdn.jsdelivr.net/easyxdm/2.4.17.1/json2.js', function () {
                        Retreaver['easyxdm_loaded'] = true;
                        callback();
                    });
                });
            }
        };

        self.buildPost = function (obj) {
            var post_vars = '';
            for (var k in obj) {
                post_vars += k + "=" + obj[k] + '&';
            }
            return post_vars;
        };

        self.loadScript = function (scriptUrl, afterCallback) {
            var firstScriptElement = document.getElementsByTagName('script')[0];
            var scriptElement = document.createElement('script');
            scriptElement.type = 'text/javascript';
            scriptElement.async = false;
            scriptElement.src = scriptUrl;

            var ieLoadBugFix = function (scriptElement, callback) {
                if (scriptElement.readyState == 'loaded' || scriptElement.readyState == 'complete') {
                    callback();
                } else {
                    setTimeout(function () {
                        ieLoadBugFix(scriptElement, callback);
                    }, 100);
                }
            };

            if (typeof afterCallback === "function") {
                if (typeof scriptElement.addEventListener !== "undefined") {
                    scriptElement.addEventListener("load", afterCallback, false)
                } else {
                    scriptElement.onreadystatechange = function () {
                        scriptElement.onreadystatechange = null;
                        ieLoadBugFix(scriptElement, afterCallback);
                    }
                }
            }
            firstScriptElement.parentNode.insertBefore(scriptElement, firstScriptElement);
        };
        initialize(options);
        self.config = config;
    };
    Request.connection = function () {
        if (typeof window.Retreaver._connection === 'undefined') {
            window.Retreaver._connection = new Retreaver.Base.Request({addr: 'api.rtvrapi.com', http_prefix: 'http', urlregex: "/\\/\\/[^\\/]*\\/(.*)/" });
        }
        return window.Retreaver._connection;
    };
    Retreaver.Base.Request = Request;
})();;(function () {
    // Dependencies
    var Base = Retreaver.Base;
    var Cookies = Retreaver.Base.Cookies;
    var Base64 = Retreaver.Base.Base64;
    var Request = Retreaver.Base.Request;
    /**
     * @constructor
     * @memberof Retreaver.Base
     * @param {Object}  options
     * @param {String}  options.campaign_key - The campaign uuid.
     * @param {Object}  options.tags - The tags to search for.
     * @param {String}  [options.default_number_replacement]
     * @param {String}  [options.message_replacement]
     * @param {Array}   [options.target_map]
     * @param {Array}   [options.target_map_cs]
     * @param {String}  [options.timer_offset]
     * @param {String}  [options.timer_offset_cs]
     */
    var RequestNumber = function (options) {

        function initialize(options) {
            // assert required keys and assign if valid
            config = Base.assert_required_keys(options, 'campaign_key');
        }

        // INIT
        var self = this;
        var config = {};
        var resource_url = '/api/v1/numbers?';

        /**
         * Request the number
         * @memberOf Retreaver.Base.RequestNumber
         * @function perform
         * @instance
         * @param {Function} callback - Callback to fire after request
         */
        self.perform = function (callback) {
            if (typeof callback !== 'function') {
                throw "ArgumentError: Expected to receive a callback function"
            }
            var request_url = resource_url + '&campaign_key=' + config['campaign_key'];

            // append configs to url if provided
            if (config['default_number_replacement']) {
                request_url = request_url + "&default_number=" + config['default_number_replacement'];
            }
            if (config['message_replacement']) {
                request_url = request_url + "&message=" + config['message_replacement'];
            }

            var body = new Object();

            var uri = document.location.href;

            body['u'] = Base64.encode(uri);
            body['st'] = Base64.encode(tags_to_script_tags(config.number_matching_tags));

            var ou = Cookies.get('CallPixels-ou');
            if (getParts([document.location.href])['cpreset'] || !ou) {
                Cookies.set('CallPixels-ou', body['u']);
            } else {
                body['ou'] = ou;
            }

            function sendGARequest(ga_acct, ga_cookies) {
                body['ga'] = Base64.encode(ga_acct);
                body['c'] = Base64.encode(JSON.stringify(ga_cookies));
                Request.connection().getJSON(request_url, body, callback);
            }


            var ga_acct = 'FAILED';

            try {
                _gaq.push(function () {
                    ga_acct = eval('_gat._getTrackerByName()._getAccount()');

                    sendGARequest(ga_acct, getGACookies());
                });

            } catch (e) {

                try {
                    ga(function (tracker) {
                        var clientId = tracker.get('clientId');
                        var allTrackers = eval('ga.getAll()');
                        ga_acct = allTrackers[0].get('trackingId');

                        var ga_cookies = {};
                        ga_cookies['__utma'] = clientId;
                        ga_cookies['mp'] = 'yes';
                        sendGARequest(ga_acct, ga_cookies);
                    });

                } catch (f) {
                    // Post back with failed ga_acct.
                    Request.connection().getJSON(request_url, body, callback);
                }
            }

        };

        function getParts(urls) {
            var all_parts = {};
            for (var i = 0; i < urls.length; i++) {
                var url_parts = getUrlParts(urls[i]);
                for (var attrname in url_parts) {
                    all_parts[attrname] = url_parts[attrname];
                }
            }
            return all_parts;
        }

        function getUrlParts(url) {
            // url contains your data.
            var objURL = new Object();
            try {
                //REGEX_1: /\?(.*)/
                url = url.match(eval("/\\?(.*)/"))[0];
            } catch (e) {
                return objURL;
                //Ignored
            }

            // Use the String::replace method to iterate over each
            // name-value pair in the query string. Location.search
            // gives us the query string (if it exists).
            url.replace(
                new RegExp("([^?=&]+)(=([^&]*))?", "g"),

                // For each matched query string pair, add that
                // pair to the URL struct using the pre-equals
                // value as the key.
                function ($0, $1, $2, $3) {
                    objURL[ $1.toLowerCase() ] = $3;
                }
            );

            return objURL;
        }

        function getGACookies() {
            var ga_cookies = ['__utma', '__utmb', '__utmc', '__utmz', '__utmv'];
            var cookies = new Object();
            for (var i in ga_cookies) {
                var cookie_val = extractCookie(ga_cookies[i]);

                if (cookie_val || i > 0) {
                    if (cookie_val) cookies[ga_cookies[i]] = cookie_val;
                } else {
                    break;
                }
            }
            return cookies;
        }

        function extractCookie(name) {
            var regex = new RegExp(name + '=([^;]*)', 'g');
            try {
                return regex.exec(document.cookie)[1];
            } catch (e) {
                return false;
            }
        }

        function findOne(all_parts, var_arr) {
            for (var look_for in var_arr) {
                for (var attrname in all_parts) {
                    if (attrname == var_arr[look_for]) {
                        return all_parts[attrname];
                    }
                }
            }
            return false
        }

        initialize(options);
    };

    function tags_to_script_tags(tags) {
        var script_tags = '';
        for (var key in tags) {
            var value = tags[key];
            script_tags = script_tags + '&' + key + '=' + value
        }
        return script_tags;
    }

    Retreaver.Base.RequestNumber = RequestNumber;
})();

;window.Retreaver.Cache = {};;(function () {
    // Dependencies
    var Base = Retreaver.Base;
    /**
     * @constructor
     * @memberOf Retreaver
     * @param {Object} attributes - Attributes
     * @property {Object} attributes
     * @property {Number} attributes.id - The CallPixels internal number ID.
     * @property {String} attributes.formatted_number - Nationally formatted phone number.
     * @property {String} attributes.number - E.164 formatted phone number.
     * @property {String} attributes.extension - The extension number.
     * @property {String} attributes.plain_number - The unformatted phone number digits.
     * @property {String} attributes.human_number - The phone number digits with extension.
     * @property {Boolean} attributes.target_open - Whether there is an open, available target.

     */
    Retreaver.Number = function (options) {

        var self = this;
        self.type = 'numbers';

        function initialize(data) {
            self.store(data);
            self.set('is_active', 'true');
        }

        /**
         * Add tags to a number.
         * @memberOf Retreaver.Number
         * @function add_tags
         * @instance
         * @param {Object} tags - A collection of tags {key: 'value', tag2: 'value2'}
         * @param {Function} callback - Callback that will be fired after request.
         * @throws Will throw an error if attempting to modify tags on a number that doesn't belong to a number pool
         * with per-visitor numbers enabled.
         */
        self.add_tags = function (tags, callback) {
            ensure_is_per_visitor();
            self.post_data('numbers/tag', tags_payload(tags), callback);
        };

        /**
         * Remove tags from a number.
         * @memberOf Retreaver.Number
         * @function remove_tags
         * @instance
         * @param {Object} tags - A collection of tags {key: 'value', tag2: 'value2'}
         * @param {Function} callback - Callback that will be fired after request.
         * @throws Will throw an error if attempting to modify tags on a number that doesn't belong to a number pool
         * with per-visitor numbers enabled.
         */
        self.remove_tags = function (tags, callback) {
            ensure_is_per_visitor();
            self.post_data('numbers/untag', tags_payload(tags), callback);
        };

        /**
         * Removes all tags with given keys from a number.
         * @memberOf Retreaver.Number
         * @function remove_tags_by_keys
         * @instance
         * @param {Array} keys - An array of keys to remove. eg: ['key1', 'key2']
         * @param {Function} callback - Callback that will be fired after request.
         * @throws Will throw an error if attempting to modify tags on a number that doesn't belong to a number pool
         * with per-visitor numbers enabled.
         */
        self.remove_tags_by_keys = function (keys, callback) {
            ensure_is_per_visitor();
            if (typeof(keys) === 'string') keys = keys.split(',');
            var payload = {
                tag_keys: keys,
                ids: [ get('id') ],
                campaign_key: get('campaign_key')
            };
            self.post_data('numbers/untag/keys', payload, callback);
        };

        /**
         * Clear all tags from a number.
         * @memberOf Retreaver.Number
         * @function clear_tags
         * @instance
         * @param {Function} callback - Callback that will be fired after request.
         * @throws Will throw an error if attempting to modify tags on a number that doesn't belong to a number pool
         * with per-visitor numbers enabled.
         */
        self.clear_tags = function (callback) {
            ensure_is_per_visitor();
            var payload = {
                ids: [ get('id') ],
                campaign_key: get('campaign_key'),
                all: 'true'
            };
            self.post_data('numbers/untag', payload, callback);
        };

        /**
         * Release number back to pool.
         * @memberOf Retreaver.Number
         * @function release
         * @instance
         */
        self.release = function () {
            self.set('is_active', 'false');
        };

        /**
         * Start a call immediately by having a campaign target dial the visitor.
         * @memberOf Retreaver.Number
         * @function initiate_call
         * @instance
         * @param {String} dial - The number to call.
         * @param {Object} payload - A collection of tags as key-value pairs and optional secure override properties.
         * @param {string} [payload.target_map] - A string mapping a placeholder number to a phone number.
         * @param {string} [payload.target_map_cs] - A SHA1 checksum of the target_map concatenated with your CallPixels API
         * key.
         * @param {number} [payload.timer_offset] - Number of seconds to offset the "connect" duration timers by.
         * @param {string} [payload.timer_offset_cs] - An SHA1 checksum of the timer_offset concatenated with your
         * CallPixels API key.
         * @param {(string|number)} [payload.*] - Key value pairs treated as tags.
         * @param {Function} callback - Callback that will be fired after request.
         * @example
         * number.initiate_call('4166686980', {company_name: 'CallPixels'}, function (call) {
         *     alert('Call started with UUID ' + call.uuid)
         * });
         */
        self.initiate_call = function (dial, payload, callback) {
            if (typeof(payload) === 'undefined') payload = {};
            // assign dial to payload
            payload.dial = dial;
            // merge payload into payload
            payload = Base.merge(self.get('id', 'campaign_key'), payload);
            // post the payload
            self.post_data('numbers/initiate_call', payload, callback);
        };

        function tags_payload(tags) {
            if (typeof(tags) === 'string') tags = Retreaver.Number.extract_tags_from_string(tags);
            return {
                tag_values: tags,
                ids: [ get('id') ],
                campaign_key: get('campaign_key')
            };
        }

        function get(key) {
            return self.get(key);
        }

        function ensure_is_per_visitor() {
            if (self.get('is_per_visitor') === false) {
                throw "Error: Tried to add tags to non per-visitor number.";
            }
        }

        initialize(options);
    };

    Retreaver.Number.extract_tags_from_string = function (tags) {
        var output = {};
        var tags = tags.split(",");
        for (var i = 0; i < tags.length; i++) {
            var tag = tags[i].split(":");
            output[tag[0]] = tag[1]
        }
        return output;
    };

    Retreaver.Number.prototype = new Retreaver.Base.Model();

    function ping_active_numbers(callback) {
        if (typeof(Retreaver.Base.Data._store) !== 'undefined') {
            // get numbers
            var numbers = Retreaver.Base.Data._store['numbers'];
            // for each number
            if (typeof(numbers) !== 'undefined') {
                // group number_ids by campaign_key
                var grouped = {};
                for (var primary_key in numbers) {
                    var number = numbers[primary_key];
                    if (number.is_active === 'true') {
                        if (typeof(grouped[number.campaign_key]) === 'undefined') {
                            grouped[number.campaign_key] = [];
                            grouped[number.campaign_key]['ids'] = [];
                            grouped[number.campaign_key]['hashes'] = [];
                        }
                        grouped[number.campaign_key]['ids'].push(number.id);
                        grouped[number.campaign_key]['hashes'].push(number.id_checksum);
                    }
                }
                // ping each group of number_ids
                for (var campaign_key in grouped) {
                    var payload = {
                        ids: grouped[campaign_key].ids,
                        hashes: grouped[campaign_key].hashes
                    };
                    Retreaver.Base.Request.connection().postJSON('/api/v1/numbers/ping', payload, [Retreaver.Base.Model.update, callback], this);
                }
            }
        }
        // call recursively
        setTimeout(ping_active_numbers, 15000);
    }

    // always ping active numbers
    ping_active_numbers();

})();;(function () {
    // Dependencies
    var RequestNumber = Retreaver.Base.RequestNumber;
    /**
     * @constructor
     * @memberOf Retreaver
     * @param {Object} options
     * @param {String} options.campaign_key - Campaign key
     * @example
     * var campaign = new Retreaver.Campaign({ campaign_key: '67d9fb1917ae8f4eaff36831b41788c3' });
     */
    var Campaign = function (options) {

        function initialize(data) {
            // initialize data store
            self.store(data);
        }

        var self = this;
        self.type = 'campaigns';
        self.primary_key('campaign_key');
        self.numbers = [];

        /**
         * Fetch a campaign number.
         * @memberOf Retreaver.Campaign
         * @function request_number
         * @instance
         * @param {Object} tags - A collection of tags as key-value pairs. The number returned will match these tags.
         * @param {getNumberCallback} callback - Callback fired if the request completes successfully.
         * @param {Function} error_callback - Callback fired if the request raises an error.
         * @example
         * campaign.request_number({calling_about: 'support'}, function (number) {
         *   alert(number.get('number'))
         * }, function(response){
         *   alert('something went wrong: ' + response);
         * };
         */
        self.request_number = function (tags, callback, error_callback) {
            // if the first argument is a function, the user has decided to skip passing tags
            // therefore cascade the arguments upwards so that everything works as expected
            if (typeof(tags) === 'function') {
                // argument 3 becomes argument 2
                error_callback = callback;
                // argument 2 becomes argument 1
                callback = tags;
                // argument 1 becomes an empty tags object
                tags = {};
            }
            // assign the tags (this is important since it runs it through set_number_matching_tags)
            self.set('number_matching_tags', tags);
            // request the number
            new RequestNumber(self.get('campaign_key', 'number_matching_tags')).perform(function (data) {
                // did retreaver return a valid number?
                if (typeof(data) !== 'undefined' && typeof(data.number) !== 'undefined' && data.number !== '') {
                    // initialize number
                    var number = new Retreaver.Number(data.number);
                    // call callback
                    callback.apply(self, [number]);
                }
                // otherwise fire the error callback
                else if (typeof(error_callback) === 'function') {
                    error_callback.apply(self, [data]);
                }
            });
        };
        /**
         * Retreaver.Campaign#request_number callback fired after the request completes.
         * @callback getNumberCallback
         * @param {Retreaver.Number} - The number that was returned
         */

        self.numbers = function () {
            var output = [];
            if (typeof(Retreaver.Base.Data._store) !== 'undefined') {
                // get numbers
                var numbers = Retreaver.Base.Data._store['numbers'];
                // present?
                if (typeof(numbers) !== 'undefined') {
                    // collect numbers matching this campaign
                    for (var primary_key in numbers) {
                        var number = numbers[primary_key];
                        if (self.get('campaign_key') == number.campaign_key) {
                            output.push(new Retreaver.Number(number));
                        }
                    }
                }
            }
            return output;
        };

        self.set_number_matching_tags = function (tags) {
            if (typeof(tags) === 'string') {
                tags = Retreaver.Number.extract_tags_from_string(tags);
            }
            if (tags && (typeof tags === "object") && !(tags instanceof Array)) {
                return tags
            }
            else {
                throw "ArgumentError: Expected number_matching_tags to be an object. eg: {tag: 'value'}";
            }
        };

        initialize(options);
    };
    Campaign.prototype = new Retreaver.Base.Model();
    Retreaver.Campaign = Campaign;
})();;(function (context) {
    context.Callpixels = window.Retreaver;
})(window);
