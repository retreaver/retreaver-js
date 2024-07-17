(function() {
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
    var Campaign = function(options) {

        function initialize(data) {
            // initialize data store
            self.store(data);
        }

        function find_and_replace_number(replacement_numbers) {
            for (var i = 0; i < replacement_numbers.length; i++) {
                var rn = replacement_numbers[i];

                Retreaver.Vendor.findAndReplaceDOMText(document.getElementsByTagName('body')[0], {
                    find: rn['find'],
                    replace: rn['replace_with']
                });

                var links = document.getElementsByTagName('a');
                for (var j = 0; j < links.length; j++) {
                    var link = links[j];
                    var href = link.getAttribute('href');

                    if (href !== null) {
                        var match = href.match(/^(tel:|clk[a-z]\/tel\/)(.*)/);
                        if (match && match[2] === rn['find']) {
                            link.setAttribute('href', match[1] + rn['replace_with']);
                        }
                    }
                }
            }
        }

        function get_integration_config(number, integration) {
            const integrations = number.get("integrations");

            if (typeof(integrations) != 'object') {
                return;
            }

            const integrationConfig = integrations[integration];
            if (typeof(integrationConfig) == 'undefined') {
                return;
            }

            return integrationConfig;
        }

        function handle_true_call_integration(number) {
            const trueCallConfig = get_integration_config(number, "truecall.com");

            if (typeof(trueCallConfig) == 'undefined') {
                return;
            }

            // Load the trueCall script into the page it it's missing
            if(!document.getElementById("__tc_script") || !window.TrueCall) {
                (function () {
                    const trueCallScriptTag = document.createElement('script');
                    trueCallScriptTag.type = 'text/javascript';
                    trueCallScriptTag.async = true;
                    trueCallScriptTag.defer = true;
                    trueCallScriptTag.dataset.tc_campaign_id = trueCallConfig["tcCampaignId"];
                    trueCallScriptTag.id = "__tc_script"
                    trueCallScriptTag.src = trueCallConfig["scriptSrc"];
                    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(trueCallScriptTag);
                })();
            }

            const obtainTrueCallId = new Promise(function(resolve) {
                const trueCallInterval = setInterval(function() {
                    if (window.TrueCall && window.TrueCall.getId()) {
                        resolve(window.TrueCall.getId())
                        clearInterval(trueCallInterval);
                    }
                }, trueCallConfig["checkIntervalMs"]); // Try to get the trueCallId every X milliseconds
            })

            obtainTrueCallId.then(function (trueCallId) {
                const tags = {};
                tags[trueCallConfig["tagName"]] = trueCallId;
                number.replace_tags(tags);
            });
        }

        function handle_red_track_integration(number) {
            const redTrackConfig = get_integration_config(number, "red_track");

            if (typeof(redTrackConfig) == 'undefined') {
                return;
            }

            function getRedTrackClickID(name) {
                const value = '; ' + document.cookie;
                const parts = value.split('; ' + name + '=');
                if (parts.length == 2) return parts.pop().split(';').shift();
            }

            const obtainRedTrackClickID = new Promise( function (resolve) {
                const myInterval = setInterval(function () {
                    const redTrackClickID = getRedTrackClickID('rtkclickid-store');
                    if (redTrackClickID) {
                        resolve(redTrackClickID);
                        clearInterval(myInterval);
                    } else {
                        console.log('Cookie is not there');
                    }
                }, redTrackConfig["checkIntervalMs"]);
            });

            obtainRedTrackClickID.then(function (getRedTrackClickID) {
                const tags = {};
                tags[redTrackConfig["tagName"]] = getRedTrackClickID;
                number.replace_tags(tags);
            });

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
         * @param {Object} [tags] - A collection of tags as key-value pairs. The number returned will match these tags.
         * @param {getNumberCallback} callback - Callback fired if the request completes successfully.
         * @param {Function} error_callback - Callback fired if the request raises an error.
         * @example
         * campaign.request_number({calling_about: 'support'}, function (number) {
         *   alert(number.get('number'))
         * }, function(response){
         *   alert('something went wrong: ' + response);
         * };
         */
        self.request_number = function(tags, callback, error_callback) {
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

            if (typeof callback === 'undefined') {
                callback = function () {
                };
            }

            if (typeof tags === 'undefined') {
                tags = {};
            }

            // assign the tags (this is important since it runs it through set_number_matching_tags)
            self.set('number_matching_tags', tags);
            // request the number
            new RequestNumber(self.get('campaign_key', 'number_matching_tags')).perform(function(data) {
                // did retreaver return a valid number?
                if (typeof(data) !== 'undefined' && typeof(data.number) !== 'undefined' && data.number !== '') {
                    // initialize number
                    var number = new Retreaver.Number(data.number);

                    try {
                        handle_true_call_integration(number);
                    } catch (e) {
                        console.error("Could not integrate with truecall.com, ", e);
                    }

                    try {
                        handle_red_track_integration(number);
                    } catch (e) {
                        console.error("Could not integrate with Red Track, ", e);
                    }

                    // if there is a replacement in the response, replace all occurrences
                    // of that number on the page with the retreaver number
                    if (typeof(data.number.replacement_numbers) !== 'undefined') {
                        find_and_replace_number(data.number.replacement_numbers);
                    }
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
         * Auto replace all numbers on page according to campaign settings
         * Calls campaign.request_number
         * @memberOf Retreaver.Campaign
         * @function auto_replace_numbers
         * @instance
         * @param {Object} [tags] - A collection of tags as key-value pairs. The number returned will match these tags.
         * @param {getNumberCallback} callback - Callback fired if the request completes successfully.
         * @param {Function} error_callback - Callback fired if the request raises an error.
         * @example
         * campaign.auto_replace_numbers({calling_about: 'support'}, function (number) {
         *   alert(number.get('number'))
         * }, function(response){
         *   alert('something went wrong: ' + response);
         * };
         */
        self.auto_replace_numbers = function(tags, callback, error_callback) {
            if (typeof callback === 'undefined') {
                callback = function() {};
            }

            if (typeof error_callback === 'undefined') {
                error_callback = function() {};
            }
            self.request_number(tags, callback, error_callback);
        };

        /**
         * Retreaver.Campaign#request_number callback fired after the request completes.
         * @callback getNumberCallback
         * @param {Retreaver.Number} - The number that was returned
         */

        self.numbers = function() {
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

        self.set_number_matching_tags = function(tags) {
            if (typeof(tags) === 'string') {
                tags = Retreaver.Number.extract_tags_from_string(tags);
            }
            if (tags && (typeof tags === "object") && !(tags instanceof Array)) {
                return tags
            } else {
                throw "ArgumentError: Expected number_matching_tags to be an object. eg: {tag: 'value'}";
            }
        };

        initialize(options);
    };
    Campaign.prototype = new Retreaver.Base.Model();
    Retreaver.Campaign = Campaign;
})();
