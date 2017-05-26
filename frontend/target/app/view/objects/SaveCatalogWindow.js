Ext.define('Target.view.objects.SaveCatalogWindow', {
    extend: 'Ext.window.Window',

    requires: [
        'Target.view.objects.SaveCatalogController',
        'Target.view.objects.SaveCatalogModel'
    ],

    xtype: 'target-savecatalog',

    title: 'Save As',
    width: 600,
    height: 350,
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
                    name: 'name',
                    allowBlank: false,
                    maxLength: 40
                },
                {
                    xtype: 'tagfield',
                    fieldLabel: 'Filter',
                    displayField: 'fst_name',
                    publishes: 'id',
                    filterPickList: true,
                    queryMode: 'local',
                    bind: {
                        store: '{filterSets}',
                        selection: '{filterSet}'
                    }
                },
                // {
                //     xtype: 'combobox',
                //     name: 'Filter',
                //     emptyText: 'Choose Filter',
                //     displayField: 'fst_name',
                //     publishes: 'id',
                //     // bind: {
                //     //     store: '{filterSets}',
                //     //     selection: '{filterSet}'
                //     // },
                //     // listeners: {
                //     //     select: 'onSelectFilterSet'
                //     // },
                //     minChars: 0,
                //     queryMode: 'local',
                //     editable: false
                // },
                {
                    xtype: 'textfield',
                    fieldLabel: 'Description',
                    name: 'description'
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
            // bind: {
            //     disabled: '{!haveFilters}'
            // }
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
