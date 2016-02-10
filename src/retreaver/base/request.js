(function () {
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
            var protocol = window.location.protocol.replace(':', '');
            window.Retreaver._connection = new Retreaver.Base.Request({addr: 'api.rtvrapi.com', http_prefix: protocol, urlregex: "/\\/\\/[^\\/]*\\/(.*)/" });
        }
        return window.Retreaver._connection;
    };
    Retreaver.Base.Request = Request;
})();