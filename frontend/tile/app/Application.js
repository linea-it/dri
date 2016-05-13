/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('Tile.Application', {
    extend: 'Ext.app.Application',

    name: 'Tile',

    stores: [
        // TODO: add global / shared stores here
    ],

    defaultToken : 'home',

    init:function (argument) {
        // Desabilitar os erros de Aria
        Ext.enableAriaButtons = false;

        // Checar se o usuario esta logado

        Ext.Ajax.request({
           url: "/dri/api?format=json",
           success: function(response, opts) {
                // Sucesso nao precisa fazer nada        
           },
           failure: function(response, opts) {
                var pathname = window.location.pathname,
                    hostname = window.location.hostname,
                    location;

                location = Ext.String.format('http://{0}/dri/api/api-auth/login/?next={1}', hostname, pathname);

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
