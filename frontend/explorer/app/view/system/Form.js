Ext.define('Explorer.view.system.Form', {
    extend: 'Ext.form.Panel',

    xtype: 'system-form',

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
                                value: '{source}'
                            }
                        },
                        {
                            fieldLabel: 'Coadd Object ID',
                            bind: {
                                value: '{coaddObject._meta_id}'
                            }
                        },
                        {
                            fieldLabel: 'RA (deg)',
                            bind: {
                                value: '{coaddObject._meta_ra}'
                            }
                        },
                        {
                            fieldLabel: 'Dec (deg)',
                            bind: {
                                value: '{coaddObject._meta_dec}'
                            }
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    }

});
