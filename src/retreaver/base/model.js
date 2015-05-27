(function () {
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
})();