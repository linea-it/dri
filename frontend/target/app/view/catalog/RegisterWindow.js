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

    config: {
        enableRegisterDB: false,
    },

    initComponent: function () {
        var me = this;

        // Recuperar do Settigs no backend se a interface de registro pelo
        // banco de dados estara disponivel.
        try{
            me.enableRegisterDB = Settings.PRODUCT_REGISTER_DB_INTERFACE;
        }
        catch (err){
            console.warn("Setting PRODUCT_REGISTER_DB_INTERFACE not loaded.");
        }

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
                            },
                            disabled: !me.getEnableRegisterDB()
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    }
});
