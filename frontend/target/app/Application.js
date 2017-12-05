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
        'common.token.GetToken',
        'common.data.Settings'
    ],

    defaultToken : 'home',

    stores: [
        // TODO: add global / shared stores here
    ],

    init:function () {
        Ext.create('common.statistics.Events').init();
        // Ext.create('common.token.GetToken').init();

        var me = this;

        // Exemplo de como recuperar uma configuracao do settings do Django
        Settings.getSetting('TARGET_VIEWER_REGISTER_DB', me.setSetting, this);

        // Exemplo de como recuperar varias variaveis do settings do Django
        Settings.getSettings(
            [
                'TARGET_VIEWER_REGISTER_DB',
                'TARGET_VIEWER_REGISTER_DB2'
            ], me.setSettings, this);

    },

    launch: function () {
        // TODO - Launch the application
        // console.log('lauch');

        // Desabilitar os erros de Aria
        Ext.enableAriaButtons = false;

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

    onAppUpdate: function () {
        window.location.reload();
    },

    setSetting: function (data, response) {
        console.log('setSetting(%o, %o)', data, response)
        // console.log(this);
    },

    setSettings: function (data, response) {
        console.log('setSettings(%o, %o)', data, response)
        // console.log(this);
    }
});
