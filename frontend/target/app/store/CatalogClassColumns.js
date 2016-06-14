Ext.define('Target.store.CatalogClassColumns', {
    extend: 'common.store.MyStore',

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
        url: '/dri/api/productassociation'
    }

});
