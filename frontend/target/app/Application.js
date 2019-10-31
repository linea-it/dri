/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('Target.Application', {
    extend: 'Ext.app.Application',

    name: 'Target',

    requires: [
        'common.statistics.Events',
        'common.data.Settings'
    ],

    defaultToken: 'home',

    stores: [
        // TODO: add global / shared stores here
    ],

    init: function () {
        Ext.create('common.statistics.Events').init();

        var me = this;

    },

    launch: function () {
        // Desabilitar os erros de Aria
        Ext.enableAriaButtons = false;

        // Checar se o usuario esta logado
        Ext.Ajax.request({
            url: Ext.manifest.apiBaseUrl + '/dri/api/logged/get_logged/?format=json',
            success: function (response) {
                var data = JSON.parse(response.responseText);

                // Identificar o usuario no Google Analitics
                if (window.ga) ga('set', 'userId', data.id);


                // Recupera essas Settings do backend
                Settings.loadSettings([
                    'PRODUCT_REGISTER_DB_INTERFACE',
                    'PRODUCT_REGISTER_FOLDERS',
                    'PRODUCT_REGISTER_ENABLE_PUBLIC',
                    'DES_CUTOUT_SERVICE__AVAILABLE_RELEASES',
                    'DES_CUTOUT_SERVICE__MAX_OBJECTS'
                ])
            },
            failure: function (response, opts) {
                var protocol = window.location.protocol,
                    pathname = window.location.pathname,
                    hostname = window.location.hostname,
                    location;

                location = Ext.String.format(
                    '{0}//{1}/dri/api/api-auth/login/?next={2}',
                    protocol, hostname, pathname);

                window.location.assign(location);

            }
        });

    },

    onAppUpdate: function () {
        window.location.reload();
    }
});
