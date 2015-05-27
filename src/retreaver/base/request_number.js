(function () {
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

