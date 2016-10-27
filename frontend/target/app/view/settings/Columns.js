Ext.define('Target.view.settings.Columns', {
    extend: 'Ext.panel.Panel',

    requires: [
        'Target.view.settings.ColumnsController',
        'Target.view.settings.ColumnsModel',
        'Ext.ux.CheckColumn'
    ],

    xtype: 'targets-columns',

    controller: 'columns',

    viewModel: 'columns',

    config: {
        currentSetting: null
    },

    initComponent: function () {
        var me = this;
        Ext.apply(this, {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'panel',
                    // region: 'north',
                    height: 50,
                    bodyPadding: 10,
                    html: [
                        '<p>TEXT.</p>'
                    ]
                },
                {
                    xtype: 'gridpanel',
                    reference: 'gridColumns',
                    flex: 1,
                    scrollable: true,
                    bind: {
                        store: '{displayContents}'
                    },
                    selType: 'checkboxmodel',
                    columns: [
                        {
                            text     : 'Properties',
                            dataIndex: 'display_name',
                            flex: 1
                        },
                        // {
                        //     text     : 'Order',
                        //     dataIndex: 'order',
                        //     flex: 1
                        // },
                        {
                            xtype: 'widgetcolumn',
                            text: 'Visible',
                            dataIndex: 'is_visible',
                            align: 'center',
                            widget: {
                                xtype: 'checkbox',
                                checked: true,
                                listeners: {
                                    change: 'onSingleChangeVisible'
                                }
                            }
                        }
                    ],
                    // columnLines: true,
                    viewConfig: {
                        stripeRows: false,
                        markDirty: false,
                        getRowClass: function (record) {
                            return record.get('is_visible') === false ? 'hidden-row' : '';
                        },

                        plugins: {
                            ptype: 'gridviewdragdrop',
                            containerScroll: true
                        },
                        listeners: {
                            drop: 'onDropGrid'
                        }
                    },
                    tbar: [
                        '->',
                        {
                            xtype: 'button',
                            text: 'Change Visibility',
                            handler: 'onChangeVisible',
                            bind: {
                                disabled: '{!gridColumns.selection}'
                            }
                        }
                    ]
                }
            ],
            buttons: [
                {
                    text: 'Previous',
                    scope: me,
                    handler: function () {
                        this.fireEvent('previous');
                    }
                },
                {
                    text: 'Finish',
                    scope: me,
                    handler: function () {
                        this.fireEvent('finish', this);
                    }
                }
                // {
                //     text: 'Next',
                //     scope: me,
                //     handler: function () {
                //         this.fireEvent('next');
                //     }
                // }
            ]
        });

        me.callParent(arguments);
    },

    setCurrentSetting: function (currentSetting) {

        if (this.currentSetting !== null) {
            if (this.currentSetting.get('id') == currentSetting.get('id')) {
                return;
            }
        }

        this.currentSetting = currentSetting;

        this.getViewModel().set('currentSetting', currentSetting);

        this.fireEvent('changesetting', currentSetting);
    }

});
