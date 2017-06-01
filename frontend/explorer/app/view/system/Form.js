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
                                value: ''
                            }
                        },
                        {
                            fieldLabel: 'Object ID',
                            bind: {
                                value: '{object._meta_id}'
                            }
                        },
                        {
                            fieldLabel: 'RA, Dec (deg)',
                            bind: {
                                value: '{object._meta_ra}, {object._meta_dec}'
                            }
                        }
                        // {
                        //     fieldLabel: 'RA (deg)',
                        //     bind: {
                        //         value: '{object._meta_ra}'
                        //     }
                        // },
                        // {
                        //     fieldLabel: 'Dec (deg)',
                        //     bind: {
                        //         value: '{object._meta_dec}'
                        //     }
                        // }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    }

});
