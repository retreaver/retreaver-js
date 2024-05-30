(function () {
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
})();