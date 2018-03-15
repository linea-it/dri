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
                                value: '{display_ra}, {display_dec}'
                            }
                        },
                        {
                            fieldLabel: 'Radius (arcmin)',
                            bind: {
                                value: '{display_radius}'
                            }
                        },
                        {
                            fieldLabel: 'Proccess Id',
                            bind: {
                                value: '{currentProduct.epr_original_id}'
                            }
                        },
                        {
                            fieldLabel: 'VAC',
                            bind: {
                                value: '{vacCluster.epr_original_id} - {vacCluster.prd_display_name}'
                            }
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    }

});
