Ext.define('Target.store.CatalogColumns', {
    extend: 'common.store.MyStore',

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
        url: '/dri/api/productcolumns'
    }

    // sorters: [{
    //     property: 'ordinal_position',
    //     direction: 'ASC'
    // }]
});
