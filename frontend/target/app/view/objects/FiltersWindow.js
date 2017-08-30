Ext.define('Target.view.objects.FiltersWindow', {
    extend: 'Ext.window.Window',

    requires: [
        'Target.view.objects.FiltersController',
        'Target.view.objects.FiltersModel'
    ],

    xtype: 'target-filters-window',

    title: 'Filters',
    width: 600,
    height: 400,
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
                                    reference : 'btnClear',
                                    iconCls: 'x-fa fa-file-o',
                                    tooltip: 'New',
                                    handler: 'onFilterWindow_ClearFilterSet'
                                },
                                {
                                    xtype: 'button',
                                    reference : 'btnSave',
                                    iconCls: 'x-fa fa-floppy-o',
                                    tooltip: 'Save',
                                    handler: 'onSaveFilterSet'
                                },
                                {
                                    xtype: 'button',
                                    reference : 'btnCopy',
                                    iconCls: 'x-fa fa-files-o',
                                    handler: 'onFilterWindow_ButtonCopyClick',
                                    tooltip: 'Copy'
                                },
                                {
                                    xtype: 'tbseparator'
                                },
                                {
                                    xtype: 'button',
                                    reference : 'btnDelete',
                                    iconCls: 'x-fa fa-trash',
                                    tooltip: 'Delete',
                                    handler: 'onDeleteFilterSet'
                                },
                            ]
                        },
                        {
                            xtype: 'combobox',
                            reference: 'cmbName',                            
                            displayField: 'fst_name',
                            emptyText: 'Unamed filter',
                            publishes: 'id',
                            bind: {
                                store: '{filterSets}',
                                selection: '{filterSet}'
                            },
                            listeners: {
                                select: 'onFilterWindow_SelectFilterSet',
                                keyup: 'onFilterWindow_ChangeFilterSetValue'
                            },
                            enableKeyEvents: true,
                            minChars: 1000, //quantidade de caracteres para iniciar busca automática (autocomplete)
                            editable: true,
                            width: 558
                        },
                        {
                            xtype: 'fieldset',
                            checkboxToggle:true,
                            title: 'Rejected',
                            reference : 'chkRejected',
                            listeners:{
                                collapse: 'onFilterWindow_CheckboxRejectedChange',
                                expand: 'onFilterWindow_CheckboxRejectedChange',
                            },
                            items: [
                                {
                                    layout: 'hbox',
                                    items:[
                                        {
                                            xtype     : 'radio',
                                            boxLabel  : 'Yes',
                                            reference : 'rtrue',
                                            name      : 'rejectGroup',
                                            checked   : false,
                                            listeners :{
                                                change: 'onFilterWindow_RadioRejectedChange'
                                            }
                                        }, {
                                            xtype     : 'radio',
                                            padding   : '0 0 0 40',
                                            boxLabel  : 'No',
                                            reference : 'rfalse',
                                            name      : 'rejectGroup',
                                            checked   : false,
                                            listeners :{
                                                change: 'onFilterWindow_RadioRejectedChange'
                                            }                                            
                                        }
                                    ]
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
            text: 'Reset',
            margin: '0 10 0 20',
            reference : 'btnRemove',
            handler: 'onRemoveFilter',
            tooltip: 'Reset applied filter'
        },
        {
            text: 'Apply',
            reference : 'btnApply',
            ui: 'soft-green',
            handler: 'onApplyFilter',
            tooltip: 'Apply defined filter'
            /*bind: {
                disabled: '{!haveFilters}'
            }*/
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
            filters = vm.getStore('filters');

        if (filter){
            if (filter.modelFilterSet) {
                vm.set('filterSet',  filter.modelFilterSet);
                vm.set('filterName', filter.modelFilterSet.get('fst_name'));
            }

            me.activeAppliedFilter = filter;

            filters.setData(filter.conditions);

            //setData não dispara onload, por isso chamo aqui
            me.getController().onLoadFilterConditions();
        }

        me.renderUIStatus();
    },

    //Define os status dos componentes visuais, habilitado, desabilitado
    renderUIStatus: function(){
        var me          = this,
            vm          = me.getViewModel(),
            storeFilters    = vm.getStore('filters'),
            storeFilterSets = vm.getStore('filterSets'),
            modelFilterSet  = vm.get('filterSet'),
            btnClear    = me.lookup('btnClear'),
            btnSave     = me.lookup('btnSave'),
            btnCopy     = me.lookup('btnCopy'),
            btnDelete   = me.lookup('btnDelete'),
            btnApply    = me.lookup('btnApply'),
            btnRemove   = me.lookup('btnRemove'),
            chkRejected = me.lookup('chkRejected'),
            cmbName     = me.lookup('cmbName'),
            flag, conditionExists, conditionChangeds, nameExists, nameChanged;
        
        //checkbox Rejected
        flag = false;
        storeFilters.each(function (filter) {
            if (filter.get('fcd_property_name')=="_meta_reject"){
                flag = true;
            }
        });
        chkRejected.setExpanded(flag);

        conditionExists   = storeFilters.count() > 0;
        conditionChangeds = storeFilters.getModifiedRecords().length>0 || storeFilters.getRemovedRecords().length>0;
        nameExists        = cmbName.getValue() ? true : false;
        nameChanged       = modelFilterSet && (cmbName.getValue() != modelFilterSet.get('fst_name'));
        
        //estado dos botões
        btnSave.setDisabled  ( !((conditionExists && nameExists) && (!modelFilterSet || (modelFilterSet && nameChanged) || (modelFilterSet && conditionChangeds))) );
        btnCopy.setDisabled  ( !(modelFilterSet && modelFilterSet.get('fst_name')!='' && nameExists && conditionExists) );
        btnDelete.setDisabled( !(modelFilterSet && modelFilterSet.get('fst_name')!='') );
        btnApply.setDisabled ( !(conditionExists) );
        btnRemove.setDisabled( !me.activeAppliedFilter );
    }

});
