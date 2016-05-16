Ext.define('Tile.view.mosaic.Panel', {
    extend: 'Ext.panel.Panel',

    xtype: 'tile-mosaic',

    requires: [
        'Tile.view.mosaic.MosaicController',
        'Tile.view.mosaic.View',
        'common.BandFilter',
        'Ext.PagingToolbar'
    ],

    controller: 'mosaic',

    config:{
        store: null,
        selection: null
    },

    scrollable: 'vertical',

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            items: [
                {
                    xtype: 'tile-mosaic-view',
                    reference: 'mosaicview',
                    listeners: {
                        scope: this
                    },
                    bind: {
                        selection: '{currentDataset}'
                    }
                }
            ],

            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'top',
                    items: [
                        {
                            xtype:'bandfilter',
                            reference: 'bandfilter',
                            filters: ['g', 'r', 'i', 'z', 'Y', 'irg'],
                            defaultFilter: 'irg',
                            listeners: {
                                onfilter: 'onFilterChange'
                            }
                        }
                    ]
                },
                {
                    xtype: 'toolbar',
                    dock: 'bottom',
                    items:{
                        xtype: 'pagingtoolbar',
                        displayInfo: true
                    }
                }

            ]
        });

        me.callParent(arguments);
    },

    setStore: function (store) {
        this.callParent(arguments);

        // bind da store com a view
        this.down('tile-mosaic-view').bindStore(store);

        // bind da store com a paginacao
        this.down('pagingtoolbar').bindStore(store);

        // Toda a vez que a store for carregada a view deve ser filtrada pela
        // banda selecionada.
        store.on('load', 'onLoad', this.getController());
    },

    setSelection: function (model) {
        this.selection = model;

        this.down('tile-mosaic-view').setSelection(model);

    }

});
