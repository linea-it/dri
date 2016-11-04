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
                    height: 80,
                    bodyPadding: 10,
                    html: [
                        '<p>TEXT.</p>'
                    ]
                },
                {
                    xtype: 'panel',
                    flex: 1,
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'grid',
                            reference: 'grid1',
                            flex: 1,
                            multiSelect: true,
                            margin: '0 5 0 0',
                            bind: {
                                store: '{availableContents}'
                            },
                            selType: 'checkboxmodel',
                            viewConfig: {
                                plugins: {
                                    ptype: 'gridviewdragdrop',
                                    containerScroll: true,
                                    ddGroup: 'columns'
                                    // dragGroup: 'dd-grid-to-grid-group2',
                                    // dropGroup: 'dd-grid-to-grid-group2'
                                },
                                listeners: {
                                    drop: 'onDropGrid1'
                                }
                            },
                            columns: [
                                {
                                    text: 'Available Properties',
                                    dataIndex: 'display_name',
                                    flex: 1
                                }
                            ],
                            tbar: [
                                {
                                    xtype: 'common-searchfield',
                                    minSearch: 1,
                                    listeners: {
                                        'search': 'onSearch',
                                        'cancel': 'onSearchCancel'
                                    },
                                    flex: 1
                                }
                            ]
                        },
                        {
                            xtype: 'gridpanel',
                            reference: 'grid2',
                            flex: 1,
                            scrollable: true,
                            split: true,
                            bind: {
                                store: '{contentSettings}'
                            },
                            columns: [
                                {
                                    text: 'Displayed Properties',
                                    dataIndex: 'display_name',
                                    flex: 1
                                }
                            ],
                            viewConfig: {
                                stripeRows: false,
                                markDirty: false,
                                plugins: {
                                    ptype: 'gridviewdragdrop',
                                    containerScroll: true,
                                    ddGroup: 'columns'
                                    // dragGroup: 'dd-grid-to-grid-group2',
                                    // dropGroup: 'dd-grid-to-grid-group2'
                                },
                                listeners: {
                                    drop: 'onDropGrid2'
                                }
                            },
                            tbar: [
                                {
                                    xtype: 'common-searchfield',
                                    minSearch: 1,
                                    listeners: {
                                        'search': 'onSearchDisplayed',
                                        'cancel': 'onSearchCancelDisplayed'
                                    },
                                    flex: 1
                                }
                            ]
                        }
                    ]
                }
                // {
                //     xtype: 'gridpanel',
                //     reference: 'gridColumns',
                //     flex: 1,
                //     scrollable: true,
                //     bind: {
                //         store: '{displayContents}'
                //     },
                //     selType: 'checkboxmodel',
                //     columns: [
                //         {
                //             text     : 'Properties',
                //             dataIndex: 'display_name',
                //             flex: 1
                //         },
                //         // {
                //         //     text     : 'Order',
                //         //     dataIndex: 'order',
                //         //     flex: 1
                //         // },
                //         {
                //             xtype: 'widgetcolumn',
                //             text: 'Visible',
                //             dataIndex: 'is_visible',
                //             align: 'center',
                //             widget: {
                //                 xtype: 'checkbox',
                //                 checked: true,
                //                 listeners: {
                //                     change: 'onSingleChangeVisible'
                //                 }
                //             }
                //         }
                //     ],
                //     // columnLines: true,
                //     viewConfig: {
                //         stripeRows: false,
                //         markDirty: false,
                //         getRowClass: function (record) {
                //             return record.get('is_visible') === false ? 'hidden-row' : '';
                //         },

                //         plugins: {
                //             ptype: 'gridviewdragdrop',
                //             containerScroll: true
                //         },
                //         listeners: {
                //             drop: 'onDropGrid'
                //         }
                //     },
                //     tbar: [
                //         '->',
                //         {
                //             xtype: 'button',
                //             text: 'Change Visibility',
                //             handler: 'onChangeVisible',
                //             bind: {
                //                 disabled: '{!gridColumns.selection}'
                //             }
                //         }
                //     ]
                // }
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
                    ui: 'soft-green',
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
