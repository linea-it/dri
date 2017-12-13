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
    height: 300,
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
                    fieldDefaults: {
                        // msgTarget: 'side',
                        labelStyle: 'font-weight:bold'
                    },
                    items: [
                        {
                            xtype: 'textfield',
                            fieldLabel: 'Name',
                            name: 'name',
                            allowBlank: false,
                            maxLength: 40,
                            minLength: 3,
                            regex: /^[a-z0-9-_\s]+$/i,
                            regexText: 'Please use only letters and numbers separated by spaces \' \', minus sign \'-\' or underscore \'_\'.'
                        },
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
