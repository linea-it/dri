/**
 *
 */
Ext.define('Target.view.catalog.RegisterWindow', {
    extend: 'Ext.window.Window',

    xtype: 'targets-catalog-register-window',

    requires: [
        'Target.view.catalog.DatabaseForm',
        'Target.view.catalog.CSVForm',
        'Target.store.ProductClass',
        'common.store.Releases'
    ],

    title: 'Add Target List',

    modal: true,

    closeAction: 'destroy',

    layout: 'fit',

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            items: [
                {
                    xtype: 'tabpanel',
                    items: [
                        {
                            xtype: 'targets-catalog-csv-form',
                            listeners: {
                                scope: me,
                                newproduct: function (product) {
                                    me.fireEvent('newproduct', product);
                                    me.close();
                                }
                            }
                        },
                        {
                            xtype: 'targets-catalog-database-form',
                            listeners: {
                                scope: me,
                                newproduct: function (product) {
                                    me.fireEvent('newproduct', product);
                                    me.close();
                                }
                            }
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    }
});
