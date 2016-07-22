Ext.define('Target.store.ProductContent', {
    extend: 'common.store.MyStore',

    alias: 'store.product-content',

    requires: [
        'Target.model.CatalogColumn'
    ],

    model: 'Target.model.CatalogColumn',

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/productcontent/'
    }

});
