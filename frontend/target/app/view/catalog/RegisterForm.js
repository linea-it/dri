/**
 *
 */
Ext.define('Target.view.catalog.RegisterForm', {
    extend: 'Ext.window.Window',

    xtype: 'targets-catalog-register-form',

    requires: [
        'Target.view.catalog.RegisterController',
        'Target.store.ProductClass',
        'common.store.Releases'
    ],

    title: 'Add Target List',

    layout: 'fit',

    modal: true,

    closeAction: 'destroy',

    controller: 'register',

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
                    name: 'display_name',
                    fieldLabel: 'Name',
                    regex: /^[a-z0-9-_\s]+$/i,
                    regexText: 'Please use only letters and numbers separated by spaces \' \', minus sign \'-\' or underscore \'_\'.'
                },
                {
                    xtype: 'combobox',
                    name: 'classname',
                    fieldLabel: 'Class',
                    valueField: 'pcl_name',
                    displayField: 'pcl_display_name',
                    allowBlank: false,
                    editable: false,
                    bind: {
                        store: '{productclass}'
                    }
                },
                {
                    xtype: 'textfield',
                    name: 'database',
                    fieldLabel: 'Database',
                    maxLength: 30,
                    value: 'dessci',
                    readOnly: true
                },
                {
                    xtype: 'textfield',
                    name: 'schema',
                    fieldLabel: 'Schema',
                    maxLength: 30
                },
                {
                    xtype: 'textfield',
                    name: 'table',
                    fieldLabel: 'Tablename',
                    maxLength: 30
                },
                {
                    xtype: 'combobox',
                    name: 'release',
                    fieldLabel: 'Release',
                    displayField: 'rls_display_name',
                    valueField: 'rls_name',
                    bind: {
                        store: '{releases}'
                    }
                },
                {
                    xtype: 'checkbox',
                    boxLabel: 'Public',
                    name: 'is_public',
                    checked: true
                },
                {
                    xtype: 'textareafield',
                    name: 'description',
                    fieldLabel: 'Description'
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
