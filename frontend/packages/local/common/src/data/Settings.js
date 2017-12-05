Ext.define('common.data.Settings', {
    singleton: true,

    alternateClassName: 'Settings',

    url: '/dri/api/get_setting/',

    getSetting: function (name, callback, scope) {
        // console.log('Get Setting(%o)', name);
        var me = this;

        Ext.Ajax.request({
            url: me.url,
            method: 'GET',
            params: {
                name: name
            },
            success: function (response) {
                var data = JSON.parse(response.responseText);

                Ext.callback(callback, scope, [data[name], data])
            },
            failure: function (response, opts) {
                console.warn("Server Side Failure getSetting")

                Ext.callback(callback, scope, [null])
            }
        });
    },

    getSettings: function (vars, callback, scope) {
        // console.log('Get Setting(%o)', vars);
        var me = this;

        Ext.Ajax.request({
            url: me.url,
            method: 'GET',
            params: {
                names: vars.join()
            },
            // Ext.util.Cookies.get('csrftoken');
            success: function (response) {
                var data = JSON.parse(response.responseText);

                Ext.callback(callback, scope, [data])
            },
            failure: function (response, opts) {
                console.warn("Server Side Failure getSettings")
                Ext.callback(callback, scope, [null])
            }
        });
    }
});
