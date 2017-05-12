Ext.define('Target.view.objects.FiltersController', {
    extend: 'Ext.app.ViewController',

    requires: [

    ],

    alias: 'controller.filters',

    listen: {
        component: {
            'target-filters-window': {
                changecatalog: 'onChangeCatalog'
            }
        },
        store: {
            '#productContents': {
                load: 'onLoadContents'
            }
        }
    },

    onChangeCatalog: function (currentCatalog) {
        var me = this,
            vm = me.getViewModel(),
            contents = vm.getStore('contents');

        me.clearImputs();

        contents.addFilter({
            property: 'pcn_product_id',
            value: currentCatalog.get('id')
        });

        console.log('onChangeCatalog');

        // TODO: Carregar os Filtros Salvos

    },

    onLoadContents: function (contents) {
        // Ao carregar a store contents adicionar os atributos Rating e Reject
        var rating, reject;

        rating = Ext.create('Target.model.CatalogContent', {
            column_name: '_meta_rating',
            display_name: 'Rating'
        });

        contents.add(rating);

        // reject = Ext.create('Target.model.CatalogContent', {
        //     column_name: '_meta_reject',
        //     display_name: 'Reject'
        // });

        // contents.add(reject);

    },

    onAddFilter: function () {
        var me = this,
            vm = me.getViewModel(),
            content = vm.get('content'),
            operator = vm.get('operator'),
            value = vm.get('value'),
            filters = vm.getStore('filters'),
            filter;

        // Criar um Model com os dados do filtro
        filter = Ext.create('Target.model.FilterCondition', {
            fcd_property: content.get('id'),
            fcd_operation: operator.get('name'),
            fcd_value: value,
            property_name: content.get('column_name'),
            property_display_name: content.get('display_name'),
            operator_display_name: operator.get('display_name')
        });

        filters.add(filter);

        me.clearImputs();

        me.checkHaveFilters();

    },

    onRemoveFilterClick: function (view, recIndex, cellIndex, item, e, record) {
        var me = this;

        record.drop();

        me.checkHaveFilters();
    },

    checkHaveFilters: function () {
        var me = this,
            vm = me.getViewModel(),
            filters = vm.getStore('filters');

        if (filters.count() > 0) {
            vm.set('haveFilters', true);

        } else {
            vm.set('haveFilters', false);

        }
    },

    onSelectOperator: function (combo, operator) {
        // TODO baseado no tipo de operador escolher um tipo de campo para entrada difente

    },

    onCancelFilter: function () {
        this.getView().close();

    },

    onDeleteFilter: function () {
        var me = this,
            view = me.getView();

        view.fireEvent('disapplyfilters', me);
        me.getView().close();
    },

    onApplyFilter: function () {
        console.log('onApplyFilter');

        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            filterSet = vm.get('filterSet'),
            filterName = vm.get('filterName'),
            filterSets = vm.getStore('filterSets'),
            filters = vm.getStore('filters'),
            fset;

        // Verificar se tem nome para o filtro se tiver
        // Criar um Filter
        if ((filterName !== null) && (filterName !== '')) {
            console.log('filterName: %o', filterName);

            console.log(filterSet);
            if (filterSet.get('id') > 0) {

                // Fazer update das condicoes

            } else {
                console.log('NAO TEM FILTER SET CRIAR UM');

                view.setLoading(true);

                fset = Ext.create('Target.model.FilterSet', {
                    product: currentCatalog.get('id'),
                    fst_name: filterName
                });

                fset.save({
                    callback: function (savedRating, operation, success) {
                        if (success) {
                            var obj = Ext.decode(operation.getResponse().responseText);

                            fset.set(obj);
                            vm.set('filterSet', fset);

                            view.setLoading(false);

                            me.onCreateFilterset(fset, filters);
                        }
                    }
                });

                // filterSets.add(fset);

                // filterSets.sync({
                //     callback: function () {
                //         console.log(arguments);
                //         console.log('Criou o Filterset');
                //         var record = this.find()
                //         me.onCreateFilterset();

                //     }
                // });
            }

        }
    },

    onCreateFilterset: function (fset, filters) {
        console.log('onCreateFilterset(%o, %o)', fset, filters);
        var me = this,
            view = me.getView();

        view.setLoading(true);
        // Cria os Filter condition para o filter set criado

        filters.each(function (filter) {
            filter.set('filterset', fset.get('id'));

        }, me);

        filters.sync({
            callback: function () {
                me.applyFilters();

                view.setLoading(false);
            }
        });

    },

    applyFilters: function () {
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            filters = me.getViewModel().getStore('filters'),
            filterset = vm.get('filterSet');

        if (filters.count() > 0) {
            view.fireEvent('applyfilters', filters, filterset, me);

        } else {
            view.fireEvent('disapplyfilters', me);

        }

        view.close();
    },

    clearImputs: function () {
        var me = this,
            refs = me.getReferences(),
            property = refs.cmbProperty,
            operator = refs.cmbOperator,
            value = refs.txtValue;

        property.reset();
        operator.reset();
        value.reset();

    }

});
