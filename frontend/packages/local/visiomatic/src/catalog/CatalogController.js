Ext.define('visiomatic.catalog.CatalogController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.catalogoverlay',

    requires: [
        'visiomatic.store.Objects',
        'visiomatic.store.ExternalObjects',
        'visiomatic.model.Overlay',
        'visiomatic.filter.FiltersWindow'
    ],

    listen: {
        component: {
            'visiomatic-catalog-overlay': {
                changedataset: 'onChangeDataset'
            },
        },
    },

    baseFilters: [],

    winFilter: null,

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
                value: ['objects_catalog', 'targets', 'value_added_catalogs', 'external_catalogs']
            }
        ]

        me.baseFilters = baseFilters;
        catalogs.addFilter(baseFilters);

        catalogs.load();

    },

    onSelectCatalog: function () {
        var me = this,
            vm = me.getViewModel(),
            filters = vm.get('currentFilters'),
            tree = me.lookup('CatalogsTree'),
            catalog = tree.selection,
            btnFilter = me.lookup('btnFilter');

        // Toda vez que troca de catalogo zera os filtros so para garantir.
        filters = [];
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
            filters = vm.get('currentFilters'),
            overlays = vm.getStore('overlays'),
            drawEllipse = vm.get('drawEllipse'),
            overlay;

        vm.set('currentCatalog', catalog);

        overlay = Ext.create('visiomatic.model.Overlay', {
            name: catalog.get('prd_display_name'),
            catalog: catalog,
            color: Ext.String.format('#{0}', color),
            visible: true,
            count: null,
            layers: null,
            ellipse: drawEllipse,
            status: 'loading',
            filters: null
        });

        overlays.add(overlay);

        // Verificar se o Catalogo e externo
        if (!catalog.get('external_catalog')) {
            // Se for catalogos do DRI
            overlay.set('objects', Ext.create('visiomatic.store.Objects', {}));
            overlay.set('filters', filters);

            me.loadObjects(overlay);
        } else {
            overlay.set('objects', Ext.create(
                'visiomatic.store.ExternalObjects', {}));

            overlay.set('objectUrl', true);

            me.loadExternalCatalogObjects(overlay)
        }

    },

    loadExternalCatalogObjects: function (overlay) {
        // console.log('loadExternalCatalogObjects(%o)', overlay)
        var me = this,
            vm = me.getViewModel(),
            visiomatic = vm.get('visiomatic'),
            store = overlay.get('objects'),
            bounds;

        // pegar os parametros de posicao e passar para a store
        bounds = visiomatic.getBounds()

        store.addFilter([
            {
                property: 'cds_source',
                value: overlay.get('catalog').get('cds_source')
            },
            {
                property: 'cds_fieldnames',
                value: overlay.get('catalog').get('cds_fieldnames')
            },
            {
                property: 'lat',
                value: bounds.lat
            },
            {
                property: 'lng',
                value: bounds.lng
            },
            {
                property: 'dlat',
                value: bounds.dlat
            },
            {
                property: 'dlng',
                value: bounds.dlng
            }
        ]);

        store.load({
            callback: function (store, operation, successful) {
                me.onLoadObjects(overlay, operation, successful);
            }
        })
    },

    loadObjects: function(overlay) {
        // console.log('loadObjects(%o)', overlay);
        var me = this,
            vm = me.getViewModel(),
            visiomatic = vm.get('visiomatic'),
            store = overlay.get('objects'),
            filters = overlay.get('filters'),
            conditions = [],
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
        ]);


        // Adicionar os Filtros selecionados pelo usuario
        if (filters !== null) {

            Ext.each(filters, function(condition) {

                conditions.push({
                    property: condition.get('fcd_property_name'),
                    operator: condition.get('fcd_operation'),
                    value: condition.get('fcd_value')
                });
            })

            store.addFilter(conditions);
        }


        store.load({
            callback: function (store, operation, successful) {
                me.onLoadObjects(overlay, operation, successful);
            }
        })
    },

    onLoadObjects: function (overlay, operation, successful) {
        var me = this,
            vm = me.getViewModel(),
            visiomatic = vm.get('visiomatic'),
            store = overlay.get('objects'),
            msg, excess;

        overlay.set('count', store.count());

        if (!successful) {
            // Error no Servidor
            msg = Ext.String.format(
                'Sorry, there was a server error, and this operation can not be performed.</br>' +
                'Error: {0} - {1}', operation.error.status, operation.error.statusText);

            overlay.set('status', 'error');
            overlay.set('status_message', msg);

            console.log("Server Side ERROR: %o - %o", operation.error.status, operation.error.statusText);
            // console.log(operation.error.response.responseText);

        } else {

            // Alterar o Status do overlay
            if (store.count() > 0) {
                // Verificar se a query possui mais registros do que o tamanho da pagina da store
                // ou seja nao estao sendo mostrados todos os objetos que satisfazem a query.
                if (store.totalCount > store.pageSize) {

                    excess = (store.totalCount - store.pageSize);

                    msg = Ext.String.format(
                        'The query returned more objects than the limit.</br>' +
                        '{0} objects are not being displayed.</br>' +
                        'Limit: {1}</br>' +
                        'Query returned: {2}</br>', excess, store.pageSize, store.totalCount)

                    overlay.set('total_count', store.totalCount);
                    overlay.set('excess', excess);
                    overlay.set('status', 'alert');
                    overlay.set('status_message', msg);

                } else {
                    overlay.set('status', 'ok');

                }

            } else {
                // se nao tiver encontrado objetos colocar como status warning
                overlay.set('status', 'warning');

            }

            layers = visiomatic.overlayCatalog(
                        overlay.get('name'),
                        store,
                        {
                            color: overlay.get('color'),
                            ellipse: overlay.get('ellipse'),
                            objectUrl: overlay.get('objectUrl')
                        });

            overlay.set('layers', layers);

        }
    },


    onRemoveOverlay: function (grid, rowIndex, colIndex) {
        var me = this,
            vm = me.getViewModel(),
            overlays = vm.getStore('overlays'),
            visiomatic = vm.get('visiomatic'),
            record = overlays.getAt(rowIndex),
            layers = record.get('layers');

        // Remover as layers no visiomatic
        if (layers !== null) {
            visiomatic.showHideLayer(layers, false);

        }

        // remover o overlay da Store
        record.erase();

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

    onClickBtnFilter: function(){
        var me = this,
            vm = me.getViewModel(),
            tree = me.lookup('CatalogsTree'),
            catalog = tree.selection;

        if ((catalog) && (catalog.get('id') > 0)) {

            me.winFilter = Ext.create('visiomatic.filter.FiltersWindow',{
                listeners: {
                    scope: me,
                    applyfilters: 'onApplyFilters',
                }
            });

            me.winFilter.setCurrentCatalog(catalog);

            me.winFilter.show();
        }
    },

    onApplyFilters: function(filters, currentCatalog) {
        var me = this,
            vm = me.getViewModel();

        if (filters.length > 0) {
            vm.set('currentFilters', filters);
        }
    }

});
