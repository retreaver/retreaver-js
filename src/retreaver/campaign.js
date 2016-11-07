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
            for (i = 0; i < replacement_numbers.length; i++) {
                rn = replacement_numbers[i];

                Retreaver.Vendor.findAndReplaceDOMText(document.getElementsByTagName('body')[0], {
                    find: rn['find'],
                    replace: rn['replace_with']
                });

                var links = document.getElementsByTagName('a');
                for (j = 0; j < links.length; j++) {
                    link = links[j];
                    href = link.getAttribute('href');

                    if (href !== null) {
                        match = href.match(/tel:(.*)/);
                        if (match && match[1] === rn['find']) {
                            link.setAttribute('href', 'tel:' + rn['replace_with']);
                        }
                    }
                }
            }
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

            // assign the tags (this is important since it runs it through set_number_matching_tags)
            self.set('number_matching_tags', tags);
            // request the number
            new RequestNumber(self.get('campaign_key', 'number_matching_tags')).perform(function(data) {
                // did retreaver return a valid number?
                if (typeof(data) !== 'undefined' && typeof(data.number) !== 'undefined' && data.number !== '') {
                    // initialize number
                    var number = new Retreaver.Number(data.number);

                    // if there is a replacement in the response, replace all occurances
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
         * @function auto_replace_number
         * @instance
         * @param {getNumberCallback} callback - Callback fired if the request completes successfully.
         * @param {Function} error_callback - Callback fired if the request raises an error.
         * @example
         * campaign.auto_replace_number({calling_about: 'support'}, function (number) {
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
