Ext.define('Target.store.CatalogClassColumns', {
    extend: 'Ext.data.Store',

    alias: 'store.catalog-class-columns',

    /**
     * @requires Target.model.CatalogColumn
     */
    requires: [
        'Target.model.CatalogColumn'
    ],

    model: 'Target.model.CatalogColumn',

    remoteFilter: true,

    proxy: {
        type: 'ajax',
        url: '/PRJSUB/TargetViewer/getCatalogClassColumns',
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty: 'totalCount'
        }
    }
});
