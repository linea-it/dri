Ext.define('visiomatic.filter.FiltersController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.overlay_filters',

    listen: {
        component: {
            'overlay-filters-window': {
                changecatalog: 'onChangeCatalog'
            }
        },
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

    },

    onLoadContents: function (contents) {
        // Ao carregar a store contents adicionar os atributos Rating e Reject
        // Todo aqui pode ser onde escolhe as propriedades dependendo da classe do catalogo.

    },

    onAddFilter: function () {
        var me = this,
            vm = me.getViewModel(),
            content = vm.get('content'),
            operator = vm.get('operator'),
            value = vm.get('value'),
            filters = vm.getStore('filters'),
            afilters = vm.get('afilters'),
            filter;

        // Criar um Model com os dados do filtro
        filter = Ext.create('visiomatic.model.FilterCondition', {
            fcd_property: content.get('id'),
            fcd_property_name: content.get('column_name'),
            fcd_operation: operator.get('name'),
            fcd_value: value,
            property_display_name: content.get('display_name'),
            operator_display_name: operator.get('display_name')
        });

        afilters.push(filter);

        filters.add(filter)

        vm.set('afilters', afilters);

        me.clearImputs();

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
            filters = vm.get('afilters'),
            btn = me.lookup('BtnApply');

        if (filters.length > 0) {
            vm.set('haveFilters', true);

        } else {
            vm.set('haveFilters', false);

        }
    },

    onSelectProperty: function (combo, property) {
        var me = this,
            vm = me.getViewModel(),
            filters = vm.get('afilters'),
            filter;

//        if (property.get('column_name') === '_meta_reject') {
//
//            // Criar um Model com os dados do filtro
//            filter = Ext.create('visiomatic.model.FilterCondition', {
//                fcd_property: property.get('id'),
//                fcd_property_name: property.get('column_name'),
//                fcd_operation: '=',
//                fcd_value: true,
//                property_display_name: property.get('display_name'),
//                operator_display_name: 'is equal to'
//            });
//
//            filters.add(filter);
//
//            me.clearImputs();
//
//            me.checkHaveFilters();
//
//        }

    },

    onSelectOperator: function (combo, operator) {
        // TODO baseado no tipo de operador escolher um tipo de campo para entrada difente

    },

    onCancelFilter: function () {
        this.getView().close();

    },

    onApplyFilter: function () {
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            filters = vm.get('afilters');

        if (filters.length > 0) {

            me.applyFilters(currentCatalog, filters);

        }
    },

    applyFilters: function (currentCatalog, filters) {
        var me = this,
            view = me.getView();


        view.fireEvent('applyfilters', filters, currentCatalog, me);

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
