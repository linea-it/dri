Ext.define('Explorer.view.star_cluster.Form', {
    extend: 'Ext.form.Panel',

    xtype: 'star_cluster-form',

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            bodyPadding: '3',
            fieldDefaults: {
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
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    }

});
