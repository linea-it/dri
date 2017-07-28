Ext.define('visiomatic.catalog.Submit', {
    extend: 'Ext.form.Panel',

    xtype: 'visiomatic-catalogs-submit',

    requires: [
        'Ext.ux.colorpick.Field'
    ],

    initComponent: function () {
        var me = this;
        Ext.apply(this, {
            bodyPadding: 5,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'fieldset',
                    flex: 1,
                    border: false,
                    items: [
                        {
                            xtype: 'colorfield',
//                            fieldLabel: 'Color',
                            labelAlign: 'top',
                            bind: '{currentColor}',
                            width: 100,
                        },
                        {
                            xtype: 'button',
                            iconCls: 'x-fa fa-filter',
                            text: 'Filters',
                            tooltip: 'Filters',
                            handler: 'onClickBtnFilter',
                            width: 100,
                        }
                    ]
                }
            ],
            buttons: [
                {
                    text: 'GO',
                    handler: 'onClickOverlay'
                }

            ]
        });

        me.callParent(arguments);
    },
});