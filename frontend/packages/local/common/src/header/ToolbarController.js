Ext.define('common.ToolbarController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.toolbar',

    logout: function () {
        var host = window.location.host,
            location = Ext.String.format('http://{0}/dri/api/api-auth/logout/?next=/dri/apps/', host);

        window.location.assign(location);
    },

    projectHome: function () {
        var host = window.location.host,
            location = Ext.String.format('http://{0}/', host);

        window.location.assign(location);

    },

    contact: function () {

        if (this.wincontact) {
            this.wincontact = null;
        }

        this.wincontact = Ext.create('common.contact.Contact', {});

        this.wincontact.show();

    },

    about: function () {
        window.open('http://www.linea.gov.br');
    }

});
