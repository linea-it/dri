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
                        '<p> Select which columns you want to display.</br>Drag and drop from the left panel into the right. You can also choose the order of the parameters.</br> Use the search form to ease your choice.</p>'
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
                                    flex: 1,
                                    renderer: function (value, meta, record) {
                                        if ((record.get('unit') !== null)  && (record.get('unit') !== '')) {
                                            return value + ' (' + record.get('unit') + ')' ;
                                        } else {
                                            return value;
                                        }
                                    }
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
                                    flex: 1,
                                    renderer: function (value, meta, record) {
                                        if ((record.get('unit') !== null)  && (record.get('unit') !== '')) {
                                            return value + ' (' + record.get('unit') + ')' ;
                                        } else {
                                            return value;
                                        }
                                    }
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
                    text: 'Cancel',
                    scope: me,
                    handler: function () {
                        this.fireEvent('finish', this);
                    }
                },
                {
                    text: 'Ok',
                    ui: 'soft-green',
                    scope: me,
                    handler: function () {
                        this.fireEvent('finish', this);
                    }
                }
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
