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
    initComponent: function () {
        var me = this;

        Ext.apply(this, {
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
                            maxLength: 40,
                            regex: /^[a-z0-9-_\s]+$/i,
                            regexText: 'Please use only letters and numbers separated by spaces \' \', minus sign \'-\' or underscore \'_\'.'
                        },
                        // {
                        //     xtype: 'tagfield',
                        //     name: 'filters',
                        //     fieldLabel: 'Filters',
                        //     displayField: 'fst_name',
                        //     publishes: 'id',
                        //     valueField: 'id',
                        //     queryMode: 'local',
                        //     allowBlank: true,
                        //     bind: {
                        //         store: '{filterSets}'
                        //     }
                        // },
                        // {
                        //     xtype: 'multiselector',
                        //     reference: 'mtsColumns',
                        //     title: 'Columns',
                        //     name: 'columns',
                        //     height: 150,
                        //     viewConfig: {
                        //         deferEmptyText: false,
                        //         emptyText: 'Choose a set of columns or leave it blank to keep them all. </br> Use + to add columns.'
                        //     },
                        //     fieldName: 'pcn_column_name',
                        //     valueField: 'pcn_column_name',
                        //     search: {
                        //         field: 'pcn_column_name',
                        //         store: Ext.create('Ext.data.Store', {
                        //             storeId: 'multiselectColumnsStore',
                        //             model: 'Target.model.CatalogColumn',
                        //             sorters: 'pcn_column_name',
                        //             proxy: {
                        //                 type: 'django',
                        //                 limitParam: null,
                        //                 url: '/dri/api/productcontent/'
                        //             }
                        //         })
                        //     }
                        // },
                        {
                            xtype: 'textarea',
                            fieldLabel: 'Comment',
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
            ]
        });
        me.callParent(arguments);
    },

    setCurrentCatalog: function (currentCatalog, activeFilter) {
        var me = this;

        if ((currentCatalog) && (currentCatalog.get('id') > 0)) {

            me.currentCatalog = currentCatalog;

            me.getViewModel().set('currentCatalog', currentCatalog);

            me.fireEvent('changecatalog', currentCatalog, activeFilter);

        }
    }
});
