/**
 *
 */
Ext.define('Target.view.catalog.CatalogController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.catalog',

    winAddCatalog: null,

    onAddCatalog: function () {
        var me = this;

        if (me.winAddCatalog !== null) {
            me.winAddCatalog.destroy();
            me.winAddCatalog = null;
        }
        me.winAddCatalog = Ext.create('Target.view.catalog.RegisterForm', {
            width: 300,
            listeners: {
                scope: this,
                close: me.reloadCatalogs
            }
        });

        me.winAddCatalog.show();

    },

    reloadCatalogs: function () {
        var me = this,
            vm = me.getViewModel(),
            catalogs = vm.getStore('catalogs');

        catalogs.load();

    },

    onRemoveCatalog: function (btn) {

        Ext.MessageBox.confirm('', 'The catalog will be removed. Do you want continue?', this.removeCatalog, this);
    },

    removeCatalog: function () {

        var me = this,
            vm = this.getViewModel(),
            store = vm.getStore('catalogs'),
            selected = vm.get('selectedCatalog');

        if (selected.get('id')) {

            selected.set('prd_flag_removed', true);

            store.sync({
                callback: function (record, operation, success) {
                    Ext.toast({
                        html: 'Data saved',
                        align: 't'
                    });

                    store.load();
                }
            });
        }
    },

    onStarredCatalog: function (btn) {
        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            selected = view.getSelectedCatalog(),
            node;

        node = view.getStore().findNode('catalog_id', selected.get('catalog_id'));

        if (selected.get('catalog_id')) {

            Ext.Ajax.request({
                url: '/PRJSUB/TargetViewer/starredCatalog',
                scope: this,
                params: {
                    'catalog_id': selected.get('catalog_id')
                },
                success: function (response) {
                    // Recuperar a resposta e fazer o decode no json.
                    var obj = Ext.decode(response.responseText);

                    if (obj.success) {
                        // Alterar o Icone no node da tree desta forma evita o reload
                        // da interface
                        if (node.get('starred') == false) {
                            node.set('iconCls', 'catalog-starred');
                            node.set('starred', true);
                        } else {
                            node.set('iconCls', 'no-icon');
                            node.set('starred', false);
                        }

                        console.log('node', '=', node);
                    } else {
                        Ext.Msg.show({
                            title: 'Sorry',
                            msg: obj.msg,
                            icon: Ext.Msg.WARNING,
                            buttons: Ext.Msg.OK
                        });
                    }
                },
                failure: function (response, opts) {
                    // TODO: Mostrar mensagem de falha
                    var msg = response.status + ' ' + response.statusText;
                    Ext.Msg.show({
                        title: 'Sorry',
                        msg: msg,
                        icon: Ext.Msg.ERROR,
                        buttons: Ext.Msg.OK
                    });
                }
            });
        }
    },

    filterByStarred: function () {
        console.log('filterByStarred');

        var me = this,
            view = me.getView();

        Ext.Ajax.request({
            url: '/PRJSUB/TargetViewer/getStarredCatalogs',
            scope: this,
            success: function (response, opts) {
                // Recuperar a resposta e fazer o decode no json.
                var obj = Ext.decode(response.responseText);

                if (obj.success != true) {
                    // Se Model.py retornar alguma falha exibe a mensagem
                    Ext.Msg.alert('Status', obj.msg);
                } else {

                    var data = obj.data;
                    console.log('data', '=', data);
                    if (data.length > 0) {

                        var search = [];
                        var ids = [];

                        for (i in data) {
                            var c = data[i];
                            ids.push(c.catalog_id);
                        }

                        console.log('ids', '=', ids);

                        var f = {
                            property: 'catalog_id',
                            value: ids.join(),
                            operator: 'in'
                        };

                        search.push(f);

                        view.filterCatalogs(search);
                    }
                }
            },
            failure: function (response, opts) {
                //console.log("server-side failure " + response.status);
                Ext.MessageBox.show({
                    title: 'Server Side Failure',
                    msg: response.status + ' ' + response.statusText,
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.WARNING
                });
            }
        });
    }
});
