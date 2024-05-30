(function () {
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
})();