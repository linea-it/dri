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
        var protocol = window.location.protocol,
            host = window.location.host,
            location = Ext.String.format(
                '{0}//{1}/dri/api/api-auth/logout/?next=/',
                protocol, host);

        window.location.assign(location);
    },

    projectHome: function () {
        // TODO pode ser alterado pelo router #
        var protocol = window.location.protocol,
            host = window.location.host,
            location = Ext.String.format(
                '{0}//{1}/',
                protocol, host);

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
        window.open('https://linea.org.br');
    },

    onAfterRender: function () {
        var me = this;

        // Carregar o username
        me.loadUsername();

        // Carregar a lista de tutoriais
        me.loaddTutorials();

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

    },

    onClickHelp: function () {
        var me = this,
            vm = me.getViewModel(),
            protocol = window.location.protocol,
            host = window.location.host,
            help_url = vm.get('help_url'),
            newLocation;

        newLocation = Ext.String.format(
            '{0}//{1}/{2}',
            protocol, host, help_url);

        window.open(newLocation);
    },

    loadUsername: function () {
        var me = this,
            vm = me.getViewModel();

        Ext.Ajax.request({
            url: '/dri/api/logged/get_logged/?format=json',
            success: function (response) {
                var data = JSON.parse(response.responseText);
                vm.set('username', data.username);
                vm.set('display_name', data.display_name);
                window.dri_username = data.username;
            }
        });
    },

    onClickApiToken: function () {
        var me = this,
            vm = me.getViewModel();

        if (me.winapitoken) {
            me.winapitoken = null;
        }

        me.winapitoken = Ext.create('common.account.ApiToken', {});

        me.winapitoken.show();
    },

});
