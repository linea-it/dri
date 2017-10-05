Ext.define('Explorer.view.coadd.Form', {
    extend: 'Ext.form.Panel',

    xtype: 'coadd-form',

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            fieldDefaults: {
                labelAlign: 'top',
                readOnly: true
            },
            items: [
                {
                    xtype: 'fieldset',
                    defaultType: 'textfield',
                    defaults: {
                        anchor: '100%'
                    },
                    items: [
                        {
                            fieldLabel: 'Source',
                            bind: {
                                value: '{currentProduct.tablename}'
                            }
                        },
                        {
                            fieldLabel: 'Object ID',
                            bind: {
                                value: '{object_data._meta_id}'
                            }
                        },
                        {
                            fieldLabel: 'RA, Dec (deg)',
                            bind: {
                                value: '{object_data._meta_ra}, {object_data._meta_dec}'
                            }
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    }

});
