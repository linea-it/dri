Ext.define('visiomatic.catalog.CatalogOverlayWindow', {
    extend: 'Ext.window.Window',

    requires: [
        'visiomatic.catalog.Catalogs',
        'visiomatic.catalog.CatalogViewModel',
        'visiomatic.catalog.CatalogController'
    ],

    xtype: 'visiomatic-catalog-overlay',

    controller: 'catalogoverlay',
    viewModel: 'catalogoverlay',

    initComponent: function () {
        var me = this;
        Ext.apply(this, {
            title: 'Catalog Overlay',
            width: 600,
            height: 450,
            closeAction: 'hide',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'visiomatic-catalogs-tree',
                    flex: 1,
                    bind: {
                        store: '{catalogs}'
                    }
                },
                {
                    xtype: 'panel',
                    flex: 1
                }
            ]

        });

        me.callParent(arguments);
    },
});