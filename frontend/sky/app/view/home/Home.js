Ext.define('Sky.view.home.Home', {
    extend: 'Ext.tab.Panel',

    xtype: 'home',

    requires: [
        'Sky.view.home.HomeController',
        'Sky.view.home.HomeModel',
        'Sky.view.footprint.Panel',
        'Sky.view.mosaic.Panel',
        'Sky.view.lists.Dataset'
    ],

    controller: 'home',

    viewModel: 'home',

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            items: [
                {
                    xtype: 'tile-footprint',
                    title: 'Footprint',
                    bind: {
                        storeSurveys: '{surveys}',
                        storeTags: '{tagsbyrelease}',
                        storeTiles: '{tiles}'
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
                        },
                        {
                            xtype: 'button',
                            text: 'Eyeballing',
                            handler: 'onEyeballing',
                            bind: {
                                disabled: '{!currentRelease}'
                            }
                        }
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
