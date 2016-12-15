Ext.define('common.ToolbarController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.toolbar',

    listen: {
        component: {
            'dri-header': {
                afterrender: 'onAfterRender'
            }
        }
    },

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
    },

    onAfterRender: function () {
        var me = this;

        // Carregar a lista de tutoriais
        me.loaddTutorials();

        // console.log(Sky.app.username);

    },

    loaddTutorials: function () {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('tutorials');

        store.addFilter([
            {
                property: 'app_name',
                value: vm.get('internal_name')
            }
        ]);

        store.load({
            scope: this,
            callback: me.onLoadTutorials
        });

    },

    onLoadTutorials: function () {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('tutorials'),
            tutorials = me.lookupReference('headermenututorials');

        if (store.count() > 0) {
            // Adicionar tutorias ao menu
            tutorials.enable();
        } else {
            // desabilitar opção tutorial
            tutorials.disable();
        }

    },

    tutorials: function () {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('tutorials');

        if (this.wincontact) {
            this.wincontact = null;
        }

        this.wintutorials = Ext.create('common.help.Tutorials', {
            store: store
        });

        this.wintutorials.show();

    }

});
