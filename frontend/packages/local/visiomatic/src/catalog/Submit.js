Ext.define('visiomatic.catalog.Submit', {
    extend: 'Ext.form.Panel',

    xtype: 'visiomatic-catalogs-submit',

    requires: [
        'Ext.ux.colorpick.Field',
        'Ext.ux.colorpick.Button'
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
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            items: [
                                {
                                    xtype: 'tbtext',
                                    html: 'Color:',
                                    width: 40
                                },
                                {
                                    xtype: 'colorbutton',
                                    bind: '{currentColor}',
                                    width: 55,
                                    margin: '0 20 0 5',
                                    tooltip: 'Choose a color. Click on the color and then on ok.'
                                },
                                {
                                    xtype: 'checkboxfield',
                                    name: 'draw_ellipse',
                                    boxLabel: 'Draw Ellipse',
                                    bind: '{drawEllipse}',
                                    reference: 'chkEllipse',
                                    flex: 1
                                },
                            ]
                        },
                        {
                            xtype: 'numberfield',
                            name: 'pointsize',
                            fieldLabel: 'Size',
                            labelWidth: 40,
                            width: 100,
                            bind: '{pointSize}',
                            minValue: 1,
                            maxValue: 10
                        },
                        {
                            xtype: 'button',
                            iconCls: 'x-fa fa-filter',
                            text: 'Filters',
                            tooltip: 'Filters',
                            handler: 'onClickBtnFilter',
                            reference: 'btnFilter',
                            width: 100,
                        }
                    ]
                }
            ],
            buttons: [
                {
                    text: 'Apply',
                    handler: 'onClickOverlay'
                }

            ]
        });

        me.callParent(arguments);
    },
});
