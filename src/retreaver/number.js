(function () {
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
     * @property {String} attributes.number_extension - The phone number digits with extension.
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

})();