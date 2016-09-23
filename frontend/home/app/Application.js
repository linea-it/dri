/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('Home.Application', {
    extend: 'Ext.app.Application',

    name: 'Home',

    requires: [
        'home.store.Menu'
    ],

    stores: [

    ],

    init: function () {
        // Desabilitar os erros de Aria
        Ext.enableAriaButtons = false;

    },

    launch: function () {
        // TODO - Launch the application
    },

    onAppUpdate: function () {
        window.location.reload();
    }
});
