Ext.define('common.ToolbarController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.toolbar',

    logout: function () {
        var host = window.location.host,
            location = Ext.String.format('http://{0}/dri/api/api-auth/logout/?next=/dri/apps/', host);

        window.location.assign(location);
    }

});
