/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('UserQuery.Application', {
    extend: 'Ext.app.Application',

    name: 'UserQuery',

    requires: [
        'common.statistics.Events'
    ],

    quickTips: false,
    platformConfig: {
        desktop: {
            quickTips: true
        }
    },

    stores: [
        // TODO: add global / shared stores here
    ],

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

                // Informa o Id o usuario para o GA, para que possa reconher usuarios unicos.
                window.gtag('config', 'GA_MEASUREMENT_ID', {
                    'user_id': data.id
                });
            },
            failure: function (response, opts) {
                var pathname = window.location.pathname;
                location = Ext.String.format('/dri/api/api-auth/login/?next={0}', pathname);

                // window.location.assign(location);
            }
        });
    },

    launch: function () {
        // TODO - Launch the application
    },

    onAppUpdate: function () {
        window.location.reload();
        // Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
        //     function (choice) {
        //         if (choice === 'yes') {
        //         }
        //     }
        // );
    }
});
