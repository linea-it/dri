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
    closeAction: 'destroy',

    bodyPadding: '6 20 6 20',

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
                    xtype: 'container',
                    items:[                   
                        {
                            xtype: 'toolbar',
                            padding: '0 0 8 0',
                            items:[
                                {
                                    xtype: 'button',
                                    iconCls: 'x-fa fa-file-o',
                                    tooltip: 'Clear filter',
                                    handler: 'onFilterWindow_ClearFilterSet'
                                },
                                {
                                    xtype: 'button',
                                    iconCls: 'x-fa fa-floppy-o',
                                    tooltip: 'Save',
                                    handler: 'onSaveFilterSet'
                                },
                                {
                                    xtype: 'button',
                                    iconCls: 'x-fa fa-files-o',
                                    handler: 'onFilterWindow_ButtonCopyClick',
                                    tooltip: 'Copy filter'
                                },
                                {
                                    xtype: 'tbseparator'
                                },
                                {
                                    xtype: 'button',
                                    iconCls: 'x-fa fa-trash',
                                    tooltip: 'Delete filter',
                                    handler: 'onDeleteFilterSet'
                                },
                            ]
                        },
                        {
                            xtype: 'combobox',
                            reference: 'cmbName',                            
                            displayField: 'fst_name',
                            emptyText: 'No filter',
                            publishes: 'id',
                            bind: {
                                store: '{filterSets}',
                                selection: '{filterSet}'
                            },
                            listeners: {
                                select: 'onFilterWindow_SelectFilterSet'
                            },
                            //minChars: 0,
                            //queryMode: 'local',
                            editable: true,
                            //readOnly: false,
                            width: 558
                        },
                        {
                            xtype:'container',
                            items:[
                                {
                                    xtype     : 'checkbox',
                                    boxLabel  : 'Rejected',
                                    reference : 'chkRejected',
                                    listeners:{
                                        change: 'onFilterWindow_CheckboxRejectedChange'
                                    }
                                }
                            ]
                        }
                        /*{
                            xtype: 'textfield',
                            fieldLabel: 'Name',
                            reference: 'txtFilter',
                            width: 535,
                            emptyText: 'Filter name (Optional)',
                            bind: {
                                value: '{filterName}'
                            }
                        }*/
                    ]
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
            viewConfig: {
                markDirty: false,
                getRowClass : function(record,id){
                    if(record.get('fcd_property_name') == '_meta_reject'){
                        return 'hide-row';
                    }
                    return 'row';
                }
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
        /*{
            iconCls: 'x-fa fa-trash',
            ui: 'soft-red',
            handler: 'onDeleteFilterSet',
            width: 40,
            tooltip: 'Delete Filter',
            disabled: true,
            reference: 'btnDeleteFilterSet'
        },*/
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

        if ((currentCatalog) && (currentCatalog.get('id') > 0)) {

            me.currentCatalog = currentCatalog;

            me.getViewModel().set('currentCatalog', currentCatalog);

            me.fireEvent('changecatalog', currentCatalog);

        }
    },

    setActiveFilter: function (filter) {
        var me = this,
            vm = me.getViewModel(),
            filters = vm.getStore('filters'),
            filterSet = vm.getStore('filterSet'),
            btnDelete = me.lookup('btnDeleteFilterSet'),
            txtFilter = me.lookup('txtFilter'),
            chkRejected = me.lookup('chkRejected'),
            filterRejectExists=false;

        if (filter){
            if (filter.modelFilterSet) {
                vm.set('filterSet',  filter.modelFilterSet);
                vm.set('filterName', filter.modelFilterSet.get('fst_name'));
            }

            filter.conditions.forEach(function(item){
                if (item.fcd_property_name=="_meta_reject"){
                    filterRejectExists = true;
                }
            });

            filters.setData(filter.conditions);

            chkRejected.setValue(filterRejectExists);
        }

        /*if ((filterset) && (filterset.get('fst_name') != '')) {

            vm.set('filterSet',  filterset);
            vm.set('filterName', filterset.get('fst_name'));

            // Filter name como readonly
            //txtFilter.setReadOnly(true);

            // Habilitar o botao de Delete FilterSet
            //btnDelete.enable();

            filters.addFilter({
                property: 'filterset',
                value: filterset.get('id')
            });

            filters.load();

        } else { */

            //Um filterSet vazio significa que é um filtro temporário, ainda não salvo

            //vm.set('filterName', null);
            
            // Filter name
            //txtFilter.setReadOnly(false);

            // Habilitar o botao de Delete FilterSet
            //btnDelete.disable();

            //filters.clearFilter();
            //filters.removeAll(true);

            //if (filterDataConditions){
                //if (filter)  filters.setData(filter.conditions);
            //}
        //}

    }

});