Ext.define('Target.store.CatalogColumns', {
    extend: 'Ext.data.Store',

    alias: 'store.catalog-columns',

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
        url: '/PRJSUB/TargetViewer/getCatalogColumns',
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty: 'totalCount'
        }
    },

    sorters: [{
        property: 'ordinal_position',
        direction: 'ASC'
    }]
});
