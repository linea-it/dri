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

    defaultToken: 'home',

    init: function (argument) {
        var me = this;
        // Desabilitar os erros de Aria
        Ext.enableAriaButtons = false;

        Ext.create('common.statistics.Events').init();

        // Checar se o usuario esta logado
        Ext.Ajax.request({
            url: Ext.manifest.apiBaseUrl + '/dri/api/logged/get_logged/?format=json',
            success: function (response) {
                var data = JSON.parse(response.responseText);

                try {
                    // Informa o Id o usuario para o GA, para que possa reconher usuarios unicos.
                    window.gtag('config', 'GA_MEASUREMENT_ID', {
                        'user_id': data.id
                    });
                }
                catch (e) { }
            },
            failure: function (response, opts) {
                var pathname = window.location.pathname;
                location = Ext.String.format('/dri/api/api-auth/login/?next={0}', pathname);
                window.location.assign(location);
            }
        });
    },

    launch: function () {
        // TODO - Launch the application
    },

    onAppUpdate: function () {
        window.location.reload();
    }
});
