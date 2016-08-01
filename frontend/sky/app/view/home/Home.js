Ext.define('Sky.view.home.Home', {
    extend: 'Ext.panel.Panel',

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
                    title: '',
                    bind: {
                        storeSurveys: '{surveys}',
                        storeTags: '{tagsbyrelease}',
                        storeTiles: '{tiles}',
                        storeMaps: '{maps}'
                    },
                    listeners: {
                        ondblclick: 'onDblClickFootprint'
                    }
                }
            ],
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'top',
                    layout: {
                        type:'hbox',
                        align:'stretch'
                    }
                }
            ]

        });

        me.callParent(arguments);
    },

    loadPanel: function () {
        this.fireEvent('loadpanel', this);

    }

});
