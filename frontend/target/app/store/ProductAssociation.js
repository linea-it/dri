Ext.define('Target.store.ProductAssociation', {
    extend: 'common.store.MyStore',

    alias: 'store.product-association',

    requires: [
        'Target.model.CatalogColumn'
    ],

    model: 'Target.model.CatalogColumn',

    remoteFilter: true,

    proxy: {
        url: '/dri/api/productassociation'
    }

});
