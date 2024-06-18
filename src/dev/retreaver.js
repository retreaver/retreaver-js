(function (context) {
    /**
     * @version dev
     * @namespace Retreaver
     */
    var Retreaver = {

        /**
         * Configure the retreaver client library.
         * @function configure
         * @memberof Retreaver
         * @param {Object} options
         * @param {String} options.host - Retreaver API Host
         * @param {String} options.prefix - http or https
         * @example
         * Retreaver.configure({host: 'api.rtvrapi.com', prefix: 'https'});
         *
         */
        configure: function (options) {
            var params = {
                addr: options.host,
                http_prefix: 'http',
                urlregex: "/\\/\\/[^\\/]*\\/(.*)/"
            };
            // check for http prefix
            if (typeof(options.prefix) !== 'undefined') {
                params.http_prefix = options.prefix;
            }
            window.Retreaver._connection = new Retreaver.Base.Request(params);
        }
    };
    context.Retreaver = Retreaver;

})(window);
