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
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            defaults: {
                                flex: 1,
                                hideLabel: true
                            },
                            items: [
                                {
                                    xtype: 'colorfield',
                                    labelAlign: 'top',
                                    bind: '{currentColor}',
                                    width: 100,
                                    margin: '0 10 0 0',
                                },
                                {
                                    xtype: 'checkboxfield',
                                    name: 'draw_ellipse',
                                    boxLabel: 'Draw Ellipse',
                                    bind: '{drawEllipse}',
                                }
                            ]
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