Ext.define('Explorer.view.system.Form', {
    extend: 'Ext.form.Panel',

    xtype: 'system-form',

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            bodyPadding: '3',
            fieldDefaults: {
                //labelAlign: 'top',
                readOnly: true
            },
            items: [
                {
                    xtype: 'fieldcontainer',
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
                        },
                        {
                            fieldLabel: 'Radius (arcmin)',
                            bind: {
                                value: '{object_data._meta_radius}'
                            }
                        },
                        {
                            xtype: 'combobox',
                            fieldLabel: 'VAC',
                            valueField: 'id',
                            displayField: 'prd_display_name',
                            queryMode: 'local',
                            bind: {
                                store: '{vacProducts}',
                            },
                            readOnly: false,
                            listeners: {
                                select: 'onSelectVacProduct'
                            }
                        },
                    ]
                }
            ]
        });

        me.callParent(arguments);
    }

});
