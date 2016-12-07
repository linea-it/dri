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
                                value: '{source}'
                            }
                        },
                        {
                            fieldLabel: 'Coadd Object ID',
                            bind: {
                                value: '{coaddObject.COADD_OBJECT_ID}'
                            }
                        },
                        {
                            fieldLabel: 'RA (deg)',
                            bind: {
                                value: '{coaddObject.RA}'
                            }
                        },
                        {
                            fieldLabel: 'Dec (deg)',
                            bind: {
                                value: '{coaddObject.DEC}'
                            }
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    }

});
