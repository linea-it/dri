/**
 *
 */
Ext.define('Target.view.catalog.RegisterForm', {
    extend: 'Ext.window.Window',

    xtype: 'targets-catalog-register-form',

    requires: [
        'Target.store.ProductClass',
        'common.store.Releases'
    ],

    title: 'Add Target List',

    layout: 'fit',

    modal: true,

    closeAction: 'destroy',

    viewModel: {
        stores: {
            productclass: {
                type: 'product_class',
                autoLoad: true,
                filters: [
                    {
                        property: 'pgr_name',
                        value: 'targets'
                    }
                ]
            },
            releases: {
                type: 'releases',
                autoLoad: true
            }
        }
    },

    items: [
        {
            xtype: 'form',
            bodyPadding: 10,
            items: [
                {
                    xtype: 'textfield',
                    name: 'name',
                    fieldLabel: 'Name'
                },
                {
                    xtype: 'combobox',
                    publishes: 'pcl_name',
                    fieldLabel: 'Class',
                    displayField: 'pcl_display_name',
                    bind: {
                        store: '{productclass}'
                    }
                },
                {
                    xtype: 'textfield',
                    name: 'schema',
                    fieldLabel: 'Schema'
                },
                {
                    xtype: 'textfield',
                    name: 'schema',
                    fieldLabel: 'Tablename'
                },
                {
                    xtype: 'combobox',
                    publishes: 'rls_name',
                    fieldLabel: 'Release',
                    displayField: 'rls_display_name',
                    bind: {
                        store: '{releases}'
                    }
                }
            ],
            defaults: {
                anchor: '100%',
                labelWidth: 120,
                labelAlign: 'top'
            }
        }
    ],

    buttons: [
        '->',
        {
            xtype: 'button',
            text: 'Submit',
            iconCls: 'x-fa fa-check',
            ui: 'soft-green',
            handler: 'addCatalog'
        },
        {
            xtype: 'button',
            text: 'Cancel',
            iconCls: 'x-fa fa-close',
            handler: 'cancelUpdate'
        }
    ]

});
