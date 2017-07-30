Ext.define('visiomatic.filter.FiltersWindow', {
    extend: 'Ext.window.Window',

    requires: [
        'visiomatic.filter.FiltersController',
        'visiomatic.filter.FiltersModel'
    ],

    xtype: 'overlay-filters-window',

    title: 'Filters',
    width: 500,
    height: 300,
    modal: true,
    autoShow: true,
    controller: 'overlay_filters',
    viewModel: 'overlay_filters',
    closeAction: 'destroy',

    bodyPadding: 20,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    config: {
        currentCatalog: null
    },

    items: [
        {
            xtype: 'form',
            reference: 'filterForm',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            border: false,
            // bodyPadding: 10,
            fieldDefaults: {
                msgTarget: 'side',
                labelAlign: 'top',
                labelWidth: 100,
                labelStyle: 'font-weight:bold'
            },
            items: [
                {
                    xtype: 'fieldset',
                    title: 'Add condition',
                    items: [
                        {
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            defaults: {
                                flex: 1
                            },
                            items: [
                                {
                                    xtype: 'combobox',
                                    emptyText: 'Property',
                                    itemId: 'cmbProperty',
                                    reference: 'cmbProperty',
                                    publishes: 'id',
                                    displayField: 'display_name',
                                    bind: {
                                        store: '{contents}',
                                        selection: '{content}'
                                    },
                                    listeners: {
                                        select: 'onSelectProperty'
                                    },
                                    minChars: 0,
                                    queryMode: 'local',
                                    editable: false,
                                    readOnly: false,
                                    margin: '0 5 0 0'
                                },
                                {
                                    xtype: 'combobox',
                                    itemId: 'cmbOperator',
                                    reference: 'cmbOperator',
                                    publishes: 'name',
                                    displayField: 'display_name',
                                    emptyText: 'Operator',
                                    bind: {
                                        store: '{operators}',
                                        selection: '{operator}'
                                    },
                                    listeners: {
                                        select: 'onSelectOperator'
                                    },
                                    minChars: 0,
                                    queryMode: 'local',
                                    editable: false,
                                    readOnly: false,
                                    forceSelection: true,
                                    margin: '0 5 0 0'
                                },
                                {
                                    xtype: 'textfield',
                                    reference: 'txtValue',
                                    emptyText: 'Value',
                                    bind: {
                                        value: '{value}'
                                    },
                                    margin: '0 5 0 0',
                                    allowBlank: false
                                },
                                {
                                    xtype: 'button',
                                    iconCls: 'x-fa fa-plus',
                                    width: 40,
                                    flex: false,
                                    handler: 'onAddFilter'
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            xtype: 'grid',
            reference: 'gridFilters',
            layout: 'fit',
            border: true,
            framed: true,
            hideHeaders: true,
            flex: 1,
            bind: {
                store: '{filters}'
            },
            viewConfig: {
                markDirty: false
            },
            columns: [
                {
                    text: 'Property',
                    dataIndex: 'property_display_name',
                    flex: 1
                },
                {
                    text: 'Operator',
                    dataIndex: 'operator_display_name',
                    flex: 1
                },
                {
                    text: 'Value',
                    dataIndex: 'fcd_value',
                    flex: 1
                },
                {
                    xtype: 'actioncolumn',
                    width: 60,
                    sortable: false,
                    menuDisabled: true,
                    align: 'center',
                    items: [
                        {
                            iconCls: 'x-fa fa-minus-circle color-soft-red',
                            tooltip: 'Remove condition',
                            handler: 'onRemoveFilterClick'
                        }
                    ]
                }
            ]
        }
    ],
    buttons: [
        {
            text: 'Cancel',
            handler: 'onCancelFilter'
        },
        {
            text: 'Ok',
            reference: 'BtnApply',
            handler: 'onApplyFilter',
            bind: {
                disabled: '{!haveFilters}'
            }
        }
    ],

    setCurrentCatalog: function (currentCatalog) {
        var me = this;

        if ((currentCatalog) && (currentCatalog.get('id') > 0)) {

            me.currentCatalog = currentCatalog;

            me.getViewModel().set('currentCatalog', currentCatalog);

            me.fireEvent('changecatalog', currentCatalog);

        }
    },

    setFilterSet: function (filterset) {
        var me = this,
            vm = me.getViewModel(),
            filters = vm.getStore('filters'),
            btnDelete = me.lookup('btnDeleteFilterSet'),
            txtFilter = me.lookup('txtFilter');

        if ((filterset) && (filterset.get('id') > 0)) {

            vm.set('filterSet', filterset);

            vm.set('filterName', filterset.get('fst_name'));

            // Filter name como readonly
            txtFilter.setReadOnly(true);

            // Habilitar o botao de Delete FilterSet
            btnDelete.enable();

            filters.addFilter({
                property: 'filterset',
                value: filterset.get('id')
            });

            filters.load();

        } else {
            // Um filterSet vazio

            vm.set('filterName', null);

            // Filter name
            txtFilter.setReadOnly(false);

            // Habilitar o botao de Delete FilterSet
            btnDelete.disable();

            filters.clearFilter();
            filters.removeAll(true);

        }

    }

});
