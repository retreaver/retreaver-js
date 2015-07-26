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
