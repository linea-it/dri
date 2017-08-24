/**
 *
 */
Ext.define('Target.view.catalog.RegisterWindow', {
    extend: 'Ext.window.Window',

    xtype: 'targets-catalog-register-window',

    requires: [
        // 'Target.view.catalog.RegisterController',
        'Target.view.catalog.DatabaseForm',
        'Target.view.catalog.CSVForm',
        'Target.store.ProductClass',
        'common.store.Releases'
    ],

    title: 'Add Target List',

    modal: true,

    closeAction: 'destroy',

    // controller: 'register',

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

    layout: 'fit',

    items: [
        {
            xtype: 'tabpanel',
            items: [
                {
                    xtype: 'targets-catalog-csv-form'
                },
                {
                    xtype: 'targets-catalog-database-form'
                }
            ]
        }
    ]
});
