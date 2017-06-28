Ext.define('visiomatic.catalog.CatalogController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.catalogoverlay',

    requires: [
        'visiomatic.store.Objects',
        'visiomatic.model.Overlay'
    ],

    listen: {
        component: {
            'visiomatic-catalog-overlay': {
                changedataset: 'onChangeDataset'
            },
        },
    },


    onChangeDataset: function (dataset) {
        console.log('onChangeDataset(%o)', dataset);
        var me = this,
            vm = me.getViewModel(),
            overlays = vm.getStore('overlays');

        // Limpar a lista de overlays
        overlays.removeAll();

        // Carregar os catalogos disponiveis
        me.loadCatalogs();
    },

    loadCatalogs: function () {
        var me = this,
            vm = me.getViewModel(),
            catalogs = vm.getStore('catalogs');


        catalogs.addFilter([
           {
                property:'group',
                value: 'targets'
            }
        ]);

        catalogs.load();

    },


    onClickOverlay: function () {
        var me = this,
            vm = me.getViewModel(),
            tree = me.lookup('CatalogsTree'),
            catalog = tree.selection,
            color = vm.get('currentColor'),
            overlays = vm.getStore('overlays'),
            overlay;

        vm.set('currentCatalog', catalog);

        overlay = Ext.create('visiomatic.model.Overlay', {
            name: catalog.get('prd_display_name'),
            catalog: catalog,
            color: Ext.String.format('#{0}', color),
            visible: true,
            count: null,
            layers: null,
            objects: Ext.create('visiomatic.store.Objects', {}),
            status: 'loading'
        });

        overlays.add(overlay);

        me.loadObjects(overlay);

    },

    loadObjects: function(overlay) {
        // console.log('loadObjects(%o)', overlay);
        var me = this,
            vm = me.getViewModel(),
            visiomatic = vm.get('visiomatic'),
            store = overlay.get('objects'),
            box;

        // Recuperar as Coordenadas da area visivel no visiomatic
        box = visiomatic.getBox();


        store.addFilter([
            {
                property: 'product',
                value: overlay.get('catalog').get('id')
            }, {
                property: 'coordinates',
                value: JSON.stringify(box)
            }
        ])

        store.load({
            callback: function () {
                me.onLoadObjects(overlay);
            }
        })
    },

    onLoadObjects: function (overlay) {
        var me = this,
            vm = me.getViewModel(),
            visiomatic = vm.get('visiomatic'),
            store = overlay.get('objects');

        overlay.set('count', store.count());

        // Alterar o Status do overlay
        // se nao tiver encontrado objetos colocar como status warning
        if (store.count() > 0) {
            overlay.set('status', 'ok');

        } else {
            overlay.set('status', 'warning');

        }

        layers = visiomatic.overlayCatalog(
                    overlay.get('name'),
                    store,
                    {
                        color: overlay.get('color')
                    });

        overlay.set('layers', layers);

    },


    onRemoveOverlay: function (grid, rowIndex, colIndex) {
        var me = this,
            vm = me.getViewModel(),
            overlays = vm.getStore('overlays'),
            visiomatic = vm.get('visiomatic'),
            record = overlays.getAt(rowIndex),
            layers = record.get('layers');

        if (layers !== null) {
            // Remover as layers no visiomatic
            visiomatic.showHideLayer(layers, false);

            // remover o overlay da Store
            record.erase();

        }
    },

    onChangeVisibility: function (cell, rowIndex, state) {
        var me = this,
            vm = me.getViewModel(),
            overlays = vm.getStore('overlays'),
            visiomatic = vm.get('visiomatic'),
            record = overlays.getAt(rowIndex),
            layers = record.get('layers');

        if (layers !== null) {
            visiomatic.showHideLayer(layers, state);

        }

    },



});
