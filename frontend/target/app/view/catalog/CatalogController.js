/**
 *
 */
Ext.define('Target.view.catalog.CatalogController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.catalog',

    winAddCatalog: null,

    requires: [
        'Target.model.Bookmarked'
    ],

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

    removeCatalog: function (btn) {

        var me = this,
            view = me.getView(),
            vm = this.getViewModel(),
            store = vm.getStore('products'),
            catalogs = vm.getStore('catalogs'),
            selected = vm.get('selectedCatalog');

        Ext.GlobalEvents.fireEvent('eventregister','TargetViewer - delete_catalog');

        if (btn === 'no') {
            return false;
        }

        if (selected.get('id')) {
            view.setLoading(true);

            store.addFilter([{property: 'id', value: selected.get('id')}]);

            store.load({
                callback: function () {
                    var record = this.first();
                    if ((record) && (record.get('id') == selected.get('id'))) {
                        this.remove(record);

                        this.sync({
                            callback: function () {
                                catalogs.load();
                                view.setLoading(false);
                            }
                        });
                    }
                }
            });
        }
    },

    onStarredCatalog: function () {
        var me = this,
            view = me.getView(),
            selected = view.getSelectedCatalog(),
            bookmark,
            node;

        if (selected && Number.isInteger(selected.get('id'))) {

            view.setLoading(true);

            node = view.getStore().findNode('id', selected.get('id'));

            if ((selected.get('bookmark') > 0) && (selected.get('starred') === true)) {
                // Criar um model setando o Id do model bookmark
                bookmark = Ext.create('Target.model.Bookmarked',{
                    'id': selected.get('bookmark')
                });

                // Deleta o Model no Backend
                bookmark.erase({
                    callback: function (saved, operation, success) {
                        if (success) {
                            // Altera os Icones e seta id bookmark como null
                            node.set('bookmark', null);
                            node.set('iconCls', 'no-icon');

                            view.setLoading(false);

                        }
                    }
                });

                Ext.GlobalEvents.fireEvent('eventregister','TargetViewer - delete_bookmark');

            } else {
                // Criar um Model sem id, com o id do produto e a flag is_starred true
                bookmark = Ext.create('Target.model.Bookmarked',{
                    'product': selected.get('id'),
                    'is_starred': true
                });

                // Adiciona novo registro no database.
                bookmark.save({
                    callback: function (saved, operation, success) {
                        if (success) {
                            var obj = Ext.decode(operation.getResponse().responseText);

                            // Altera o icon direto no tree node para que nao seja necessario fazer o reload.
                            node.set('bookmark', obj.id);
                            node.set('iconCls', 'x-fa fa-star color-icon-starred');

                            view.setLoading(false);
                        }
                    }
                });

                Ext.GlobalEvents.fireEvent('eventregister','TargetViewer - add_bookmark');
            }
        }
    },

    filterByStarred: function (btn) {
        var me = this,
            vm = me.getViewModel(),
            catalogs = vm.getStore('catalogs'),
            bookmarkeds = catalogs.filters.items.filter(function (ch) { return ch._id === 'bookmark'; });
        if (bookmarkeds.length === 0) {
            btn.setText('Show all');
            catalogs.addFilter({
                property: 'bookmark',
                value: true
            });
        } else {
            btn.setText('Show only bookmarked');
            catalogs.removeFilter('bookmark');
        }

        catalogs.load();

    }
});
