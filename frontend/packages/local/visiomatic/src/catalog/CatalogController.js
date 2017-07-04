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

    baseFilters: [],

    onChangeDataset: function (dataset) {
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
            catalogs = vm.getStore('catalogs'),
            baseFilters;


        baseFilters = [
           {
                property:'group',
                operator: 'in',
                value: ['objects_catalog', 'targets']
            }
        ]

        me.baseFilters = baseFilters;
        catalogs.addFilter(baseFilters);

        catalogs.load();

    },

    filterCatalogByname: function () {
        var me = this,
            tree = me.lookup('CatalogsTree'),
            field = me.lookup('SearchField'),
            store = tree.getStore(),
            value = field.getValue(),
            fts = [],
            f;

        if (value.length > 0) {

            field.getTrigger('clear').show();

            // checar se a store esta em loading
            if (store.isLoading()) {
                // Se a store estiver carregando ainda cancelar o ultimo
                // request antes de fazer um novo
                console.log('Store is Loading: %o', store.isLoading());

                var proxy = store.getProxy();
                proxy.abort();

                console.log('Store proxy abort');
            }

            f = {
                property: 'search',
                value: value
            };

            fts.push(f);

            me.filterCatalogs(fts);

        } else {
            field.getTrigger('clear').hide();

            me.filterCatalogs();
        }

    },

    filterCatalogs: function (search) {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('catalogs'),
            baseFilters = me.baseFilters,
            f,
            fts = Ext.clone(baseFilters);

        store.clearFilter(true);
        store.removeAll();

        if ((search) && (Array.isArray(search))) {

            for (index in search) {
                f = search[index];
                fts.push(f);
            }
        }

        store.filter(fts);
    },

    cancelFilter: function () {
        var me = this,
            field = me.lookup('SearchField');

        field.reset();

        me.filterCatalogs();

        field.getTrigger('clear').hide();
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
