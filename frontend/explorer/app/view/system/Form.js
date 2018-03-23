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
                            xtype: 'fieldcontainer',
                            fieldLabel: 'Proccess Id',
                            defaults: {
                                margin: '0 5 0 0'
                            },
                            layout: 'hbox',
                            items: [
                                {
                                    xtype: "textfield",
                                    width: 140,
                                    bind: {
                                        value: '{currentProduct.epr_original_id}'
                                    }
                                },
                                {
                                    xtype: "button",
                                    iconCls: 'fa fa-info',
                                    tooltip: "Product Log",
                                    bind: {
                                        href: '{currentProduct.productlog}',
                                        disabled: '{!currentProduct.productlog}'
                                    }
                                }
                            ]
                        },
                        {
                            xtype: 'fieldcontainer',
                            fieldLabel: 'VAC',
                            defaults: {
                                margin: '0 5 0 0'
                            },
                            layout: 'hbox',
                            items: [
                                {
                                    xtype: "textfield",
                                    width: 140,
                                    bind: {
                                        value: '{vacCluster.epr_original_id} - {vacCluster.prd_display_name}'
                                    }
                                },
                                {
                                    xtype: "button",
                                    iconCls: 'fa fa-info',
                                    tooltip: "Product Log",
                                    bind: {
                                        href: '{vacCluster.productlog}',
                                        disabled: '{!vacCluster.productlog}'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    }

});
