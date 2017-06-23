Ext.define('visiomatic.catalog.Submit', {
    extend: 'Ext.form.Panel',

    xtype: 'visiomatic-catalogs-submit',

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
//                    layout: 'anchor',
                    items: [
                        {
                            xtype: 'colorfield',
                            fieldLabel: 'Color',
                            labelAlign: 'top',
                            bind: '{currentColor}'
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