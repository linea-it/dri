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
                    items: [
                        {
                            xtype: 'colorfield',
                            fieldLabel: 'Color',
                            labelAlign: 'top',
                            bind: '{currentColor}'
                        },
                        {
                            xtype: 'button',
                            text: 'Filter',
                            handler: 'onClickBtnFilter'
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