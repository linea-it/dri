Ext.define('Sky.view.footprint.Footprint', {
    extend: 'Ext.tab.Panel',

    xtype: 'footprint',

    requires: [
        'Sky.view.footprint.FootprintController',
        'Sky.view.footprint.FootprintModel',
        'Sky.view.footprint.Aladin',
        'Sky.view.mosaic.Panel',
        'Sky.view.lists.Dataset'
    ],

    controller: 'footprint',

    viewModel: 'footprint',

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            items: [
                {
                    xtype: 'footprint-aladin',
                    title: 'Footprint',
                    bind: {
                        storeSurveys: '{surveys}',
                        storeTags: '{tagsbyrelease}',
                        storeTiles: '{tiles}',
                        storeMaps: '{maps}'
                    },
                    listeners: {
                        ondblclick: 'onDblClickFootprint'
                    }
                },
                {
                    xtype: 'tile-mosaic',
                    title: 'Mosaic',
                    bind: {
                        store: '{datasets}',
                        selection: '{currentDataset}'
                    }
                },
                {
                    xtype: 'tile-lists-dataset',
                    title: 'List',
                    bind: {
                        store: '{datasets}',
                        selection: '{currentDataset}'
                    },
                    dockedItems: [
                        {
                            xtype: 'pagingtoolbar',
                            dock: 'bottom',
                            displayInfo: true,
                            bind: {
                                store: '{datasets}'
                            }
                        }
                    ]
                }
            ],
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'top',
                    layout: {
                        type:'hbox',
                        align:'stretch'
                    },
                    items:[
                        {
                            xtype: 'combobox',
                            itemId: 'cmbReleases',
                            reference: 'cmbReleases',
                            fieldLabel: 'Release',
                            labelWidth: 50,
                            bind: {
                                store: '{releases}',
                                selection: '{currentRelease}'
                            },
                            //triggerAction: 'all',
                            displayField: 'rls_display_name',
                            valueField: 'id',
                            width: 300,
                            listeners: {
                                select: 'onSelectRelease'
                            }
                        }
                        // {
                        //     xtype: 'button',
                        //     text: 'Eyeballing',
                        //     handler: 'onEyeballing',
                        //     bind: {
                        //         disabled: '{!currentRelease}'
                        //     }
                        // }
                    ]
                }
            ]

        });

        me.callParent(arguments);
    },

    loadPanel: function () {
        this.fireEvent('loadpanel', this);

    }

});
