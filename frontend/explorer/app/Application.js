/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('Explorer.Application', {
    extend: 'Ext.app.Application',

    name: 'Explorer',

    stores: [
        // TODO: add global / shared stores here
    ],

    init: function () {
        // Desabilitar os erros de Aria
        Ext.enableAriaButtons = false;

        // Checar se o usuario esta logado
        Ext.Ajax.request({
            url: Ext.manifest.apiBaseUrl + '/dri/api/logged/get_logged/?format=json',
            success: function (response) {
                var data = JSON.parse(response.responseText);
                window.sessionStorage.setItem('dri_username', data.username);

                // Informa o Id o usuario para o GA, para que possa reconher usuarios unicos.
                window.gtag('config', 'GA_MEASUREMENT_ID', {
                    'user_id': data.id
                });
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
