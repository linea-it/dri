Ext.define('Target.view.objects.SaveCatalogWindow', {
    extend: 'Ext.window.Window',

    requires: [
        'Target.view.objects.SaveCatalogController',
        'Target.view.objects.SaveCatalogModel',
        'Ext.view.MultiSelector'
    ],

    xtype: 'target-savecatalog',

    title: 'Save As',
    width: 450,
    height: 500,
    modal: true,
    autoShow: true,
    controller: 'savecatalog',
    viewModel: 'savecatalog',
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
            reference: 'SaveAsForm',
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
                    name: 'name',
                    allowBlank: false,
                    maxLength: 40
                },
                {
                    xtype: 'tagfield',
                    name: 'filters',
                    fieldLabel: 'Filters',
                    displayField: 'fst_name',
                    publishes: 'id',
                    valueField: 'id',
                    queryMode: 'local',
                    allowBlank: false,
                    bind: {
                        store: '{filterSets}'
                        // selection: '{filterSet}'
                    }
                },
                {
                    xtype: 'multiselector',
                    title: 'Columns',
                    fieldName: 'columns',
                    valueField: 'pcn_column_name',
                    height: 200,
                    viewConfig: {
                        deferEmptyText: false,
                        emptyText: 'Choose a set of columns or leave it blank to keep them all. </br> Use + to add columns.'
                    },
                    search: {
                        field: 'pcn_column_name',
                        bind: {
                            store: '{contents}'
                        }
                    }
                },
                {
                    xtype: 'textarea',
                    fieldLabel: 'Description',
                    name: 'description',
                    maxLength: 2048
                }
            ]
        }
    ],
    buttons: [
        {
            text: 'Cancel',
            handler: 'onCancel'
        },
        {
            text: 'Save',
            iconCls: 'x-fa fa-floppy-o',
            ui: 'soft-green',
            handler: 'onSaveCatalog'
        }
    ],

    setCurrentCatalog: function (currentCatalog) {
        var me = this;

        if ((currentCatalog) && (currentCatalog.get('id') > 0)) {

            me.currentCatalog = currentCatalog;

            me.getViewModel().set('currentCatalog', currentCatalog);

            me.fireEvent('changecatalog', currentCatalog);

        }
    }

    // setFilterSet: function (filterset) {
    //     var me = this,
    //         vm = me.getViewModel(),
    //         filters = vm.getStore('filters'),
    //         btnDelete = me.lookup('btnDeleteFilterSet'),
    //         txtFilter = me.lookup('txtFilter');

    //     if ((filterset) && (filterset.get('id') > 0)) {

    //         vm.set('filterSet', filterset);

    //         vm.set('filterName', filterset.get('fst_name'));

    //         // Filter name como readonly
    //         txtFilter.setReadOnly(true);

    //         // Habilitar o botao de Delete FilterSet
    //         btnDelete.enable();

    //         filters.addFilter({
    //             property: 'filterset',
    //             value: filterset.get('id')
    //         });

    //         filters.load();

    //     } else {
    //         // Um filterSet vazio

    //         vm.set('filterName', null);

    //         // Filter name
    //         txtFilter.setReadOnly(false);

    //         // Habilitar o botao de Delete FilterSet
    //         btnDelete.disable();

    //         filters.clearFilter();
    //         filters.removeAll(true);

    //     }

    // }

});
