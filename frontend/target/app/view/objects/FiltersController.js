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
            },
            '#filterConditions': {
                load: 'onLoadFilterConditions'
            }
        }
    },

    onChangeCatalog: function (currentCatalog) {
        var me = this,
            vm = me.getViewModel(),
            contents = vm.getStore('contents');

        me.clearInputs();

        contents.addFilter({
            property: 'pcn_product_id',
            value: currentCatalog.get('id')
        });

    },

    onLoadContents: function (contents) {
        // Ao carregar a store contents adicionar os atributos Rating e Reject
        var rating, reject;

        rating = Ext.create('Target.model.CatalogContent', {
            id: null,
            column_name: '_meta_rating',
            display_name: 'Rating'
        });

        contents.add(rating);

        reject_true = Ext.create('Target.model.CatalogContent', {
            id: null,
            column_name: '_meta_reject',
            display_name: 'Rejected'
        });

        contents.add(reject_true);

        reject_false = Ext.create('Target.model.CatalogContent', {
            id: null,
            column_name: '_meta_reject',
            display_name: 'Not Rejected'
        });

        contents.add(reject_false);

    },

    onLoadFilterConditions: function () {
        var me = this;

        me.checkHaveFilters();
    },

    onAddFilter: function () {
        var me = this,
            vm = me.getViewModel(),
            content = vm.get('content'),
            operator = vm.get('operator'),
            value = vm.get('value'),
            filterSet = vm.get('filterSet'),
            filters = vm.getStore('filters'),
            filter;

        // Criar um Model com os dados do filtro
        filter = Ext.create('Target.model.FilterCondition', {
            fcd_property: content.get('id'),
            fcd_property_name: content.get('column_name'),
            fcd_operation: operator.get('name'),
            fcd_value: value,
            property_display_name: content.get('display_name'),
            operator_display_name: operator.get('display_name')
        });

        if ((filterSet) && (filterSet.get('id') > 0)) {
            filter.set('filterset', filterSet.get('id'));

        }

        filters.add(filter);

        me.clearInputs();

        me.checkHaveFilters();

    },

    onRemoveFilterClick: function (view, recIndex, cellIndex, item, e, record) {
        var me = this;

        Ext.MessageBox.confirm('',
            'The Filter will be removed. Do you want continue?',
            function (btn) {
                if (btn === 'yes') {
                    record.drop();

                    me.checkHaveFilters();
                }

            }, this);

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

    onSelectProperty: function (combo, property) {
        var me = this,
            vm = me.getViewModel(),
            filterSet = vm.get('filterSet'),
            filters = vm.getStore('filters'),
            filter;

        if (property.get('display_name') === 'Rejected') {

            // Criar um Model com os dados do filtro
            filter = Ext.create('Target.model.FilterCondition', {
                fcd_property: property.get('id'),
                fcd_property_name: property.get('column_name'),
                fcd_operation: '=',
                fcd_value: true,
                property_display_name: property.get('display_name'),
                operator_display_name: 'is equal to'
            });

            if ((filterSet) && (filterSet.get('id') > 0)) {
                filter.set('filterset', filterSet.get('id'));

            }

            filters.add(filter);

            me.clearInputs();

            me.checkHaveFilters();

        }

        if (property.get('display_name') === 'Not Rejected') {

            // Criar um Model com os dados do filtro
            filter = Ext.create('Target.model.FilterCondition', {
                fcd_property: property.get('id'),
                fcd_property_name: property.get('column_name'),
                fcd_operation: '=',
                fcd_value: false,
                property_display_name: property.get('display_name'),
                operator_display_name: 'is equal to'
            });

            if ((filterSet) && (filterSet.get('id') > 0)) {
                filter.set('filterset', filterSet.get('id'));

            }

            filters.add(filter);

            me.clearInputs();

            me.checkHaveFilters();

        }

    },

    onSelectOperator: function (combo, operator) {
        // TODO baseado no tipo de operador escolher um tipo de campo para entrada difente

    },

    onCancelFilter: function () {
        this.getView().close();

    },

    onDeleteFilterSet: function () {
        var me = this,
            vm = me.getViewModel(),
            filterSet = vm.get('filterSet'),
            view = me.getView();

        if ((filterSet) && (filterSet.get('id') > 0)) {
            filterSet.erase({
                callback: function (record, operation, success) {
                    if (success) {
                        view.fireEvent('disapplyfilters', me);
                        me.getView().close();
                    }
                }
            });
        }
    },

    onApplyFilter: function () {
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
            if (filterSet.get('id') > 0) {

                // Fazer update das condicoes
                if (filters.needsSync === true) {
                    filters.sync({
                        callback: function () {
                            // Disparar o evento
                            me.applyFilters();

                        }
                    });

                } else {
                    me.applyFilters();
                }

            } else {
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
            }
        } else {
            // Nao tem FilterName mais tem filterConditions
            if (filters.count() > 0) {
                // Aplicar como um filtro local
                fset = Ext.create('Target.model.FilterSet', {
                    product: currentCatalog.get('id'),
                    fst_name: 'Unnamed Filter'
                });

                vm.set('filterSet', fset);

                me.applyFilters();

            }
        }
    },

    onCreateFilterset: function (fset, filters) {
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
            view.fireEvent('applyfilters', filterset, filters, me);

        } else {
            view.fireEvent('disapplyfilters', me);

        }

        view.close();
    },

    clearInputs: function () {
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
