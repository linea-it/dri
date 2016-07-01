Ext.define('Target.store.ProductAssociation', {
    extend: 'common.store.MyStore',

    alias: 'store.product-association',

    requires: [
        'Target.model.CatalogColumn'
    ],

    model: 'Target.model.CatalogColumn',

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/productassociation/'
    }

});
