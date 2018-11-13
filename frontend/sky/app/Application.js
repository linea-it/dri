/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('Sky.Application', {
    extend: 'Ext.app.Application',

    name: 'Sky',

    requires: [
        'common.statistics.Events'
    ],

    stores: [
        // TODO: add global / shared stores here
    ],

    defaultToken : 'home',

    init:function (argument) {
        var me = this;
        // Desabilitar os erros de Aria
        Ext.enableAriaButtons = false;

        Ext.create('common.statistics.Events').init();

        // Checar se o usuario esta logado
        Ext.Ajax.request({
            url: '/dri/api/logged/get_logged/?format=json',
            success: function (response) {
                var data = JSON.parse(response.responseText);

                // Identificar o usuario no Google Analitics
                if (window.ga) ga('set', 'userId', data.id);
            },
            failure: function (response, opts) {
                var protocol = window.location.protocol,
                    pathname = window.location.pathname,
                    hostname = window.location.host,
                    location;

                location = Ext.String.format(
                    '{0}//{1}/dri/api/api-auth/login/?next={2}',
                    protocol, hostname, pathname);

                window.location.assign(location);

            }
        });
    },

    launch: function () {
        // TODO - Launch the application
    },

    onAppUpdate: function () {
        // window.location.reload();

    }
});
