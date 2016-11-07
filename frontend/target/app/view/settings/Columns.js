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
                        '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sed risus ornare, dignissim odio quis, fermentum odio. Proin mauris est, lobortis in malesuada ac, varius eu mi. Proin diam mi, tincidunt eu libero at, efficitur tempor nisl. Nunc feugiat, tortor vitae auctor porttitor, lectus lorem blandit orci, ut ullamcorper quam magna sit amet tellus.</p>'
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

        this.currentSetting = currentSetting;

        this.getViewModel().set('currentSetting', currentSetting);

        this.fireEvent('changesetting', currentSetting);
    }

});
