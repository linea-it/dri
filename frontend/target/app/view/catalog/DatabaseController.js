/**
 *
 */
Ext.define('Target.view.catalog.DatabaseController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.database',

    requires: [
        'Target.store.Catalogs',
        'Target.view.association.Panel'
    ],

    winAddCatalog: null,
    winAssociation: null,

    addCatalog: function () {
        var me = this,
            view = me.getView(),
            form = view.getForm(),
            values, data, name, release, isPublic, tablename, schema, table;

        if (form.isValid()) {

            values = form.getValues();

            name = values.displayName.split(' ').join('_');
            name = name.toLowerCase().trim();
            release = values.release !== '' ? [values.release] : [];
            isPublic = values.isPublic === 'on' ? true : false;

            tablename = values.tablename.split('.');
            schema = tablename[0];
            table = tablename[1];

            data = {
                products: [{
                    'type': 'catalog',
                    'class': values.classname,
                    'name': name,
                    'display_name': values.displayName,
                    'database': values.database,
                    'schema': schema,
                    'table': table,
                    'releases': release,
                    'is_public': isPublic,
                    'description': values.description
                }]
            };

            view.setLoading(true);

            // Submit Catalog
            Ext.Ajax.request({
                cors: true,
                method: 'POST',
                url: '/dri/api/importexternalprocess/',
                success: function () {
                    // Fechar a janela de registro
                    view.setLoading(false);

                    // Exibir janela de associacao
                    me.getAddedCatalog(name);

                },
                failure: function (response, opts) {
                    view.setLoading(false);

                    Ext.MessageBox.show({
                        title: 'Server Side Failure',
                        msg: response.status + ' ' + response.statusText,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.WARNING
                    });
                },
                // Headers necessarios para fazer um Post Autheticado no Django
                headers: {
                    'Accept': 'application/json',
                    'Application': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRFToken': Ext.util.Cookies.get('csrftoken')
                },
                params: Ext.util.JSON.encode(data)
            });
        }
    },

    onCancelAddCatalog: function () {
        var me = this,
            view = me.getView(),
            form = view.down('form').getForm();

        form.reset();
        view.close();

    },

    getAddedCatalog: function (name) {
        var me = this,
            store = Ext.create('Target.store.Catalogs',{}),
            catalog;

        store.filter({
            property: 'prd_name',
            value: name
        });

        store.load({
            callback: function (records, operations, success) {
                if ((success) && (records.length == 1)) {
                    catalog = store.first();

                    me.showAssociation(catalog);
                }
            }
        });
    },

    showAssociation: function (catalog) {
        var me = this;

        me.winAssociation = Ext.create('Ext.window.Window', {
            title: 'Association',
            layout: 'fit',
            closable: true,
            closeAction: 'destroy',
            width: 800,
            height: 620,
            modal:true,
            items: [{
                xtype: 'targets-association',
                listeners: {
                    scope: me,
                    cancel: 'onCloseAssociation',
                    finish: 'onFinishAssociation',
                    close: 'onCloseAssociation'
                }
            }]
        });

        me.winAssociation.down('targets-association').setCatalog(catalog);

        me.winAssociation.show();

    },

    onFinishAssociation: function (panel) {
        var me = this,
            view = me.getView(),
            product = panel.getProduct(),
            hash;

        view.fireEvent('newproduct', product);

        me.onCloseAssociation();
    },

    onCloseAssociation: function () {
        var me = this;

        if (me.winAssociation) {
            me.winAssociation.close();
        }

    },

    onChangeType: function (radiogroup, value) {
        console.log('onChangeType(%o)', value);
        var me = this,
            database = me.lookup('fldDatabase');
        console.log(database);
        if (value.type === 'csv') {
            database.setVisible(true);

        } else {

        }
    }

});
