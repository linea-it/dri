Ext.define('Target.view.objects.FiltersWindow', {
    extend: 'Ext.window.Window',

    requires: [
        'Target.view.objects.FiltersController',
        'Target.view.objects.FiltersModel'
    ],

    xtype: 'target-filters-window',

    title: 'Filters',
    width: 600,
    height: 350,
    modal: true,
    autoShow: true,
    controller: 'filters',
    viewModel: 'filters',
    closeAction: 'hide',

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
                    xtype: 'textfield',
                    fieldLabel: 'Name',
                    reference: 'txtFilter',
                    emptyText: 'Filter name (Optional)',
                    bind: {
                        value: '{filterName}'
                    }
                },
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
                                    // listeners: {
                                    //     select: 'onSelectSetting'
                                    // },
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
                                    allowBlank: false,
                                    value: 1
                                },
                                {
                                    xtype: 'button',
                                    iconCls: 'x-fa fa-plus',
                                    // ui: 'soft-green',
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
                    dataIndex: 'value',
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
            iconCls: 'x-fa fa-trash',
            ui: 'soft-red',
            handler: 'onDeleteFilter',
            width: 40,
            tooltip: 'Delete Filter',
            disabled: true
        },
        {
            text: 'Cancel',
            handler: 'onCancelFilter'
        },
        {
            text: 'Apply',
            ui: 'soft-green',
            handler: 'onApplyFilter',
            bind: {
                disabled: '{!haveFilters}'
            }
        }
    ],

    setCurrentCatalog: function (currentCatalog) {
        var me = this;

        if ((currentCatalog !== null) && (currentCatalog.get('id') > 0)) {

            console.log('currentCatalog', '=', currentCatalog.get('id'));

            me.currentCatalog = currentCatalog;

            me.getViewModel().set('currentCatalog', currentCatalog);

            me.fireEvent('changecatalog', currentCatalog);

        }
    }

});
