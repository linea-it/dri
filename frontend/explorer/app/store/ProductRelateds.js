Ext.define('Explorer.store.ProductRelateds', {
    extend: 'common.store.MyStore',

    alias: 'store.product_relateds',

    requires: [
        'common.data.proxy.Django',
        'Explorer.model.ProductRelated'
    ],

    model: 'Explorer.model.ProductRelated',

    autoLoad: false,

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/productrelated/'
    }

});
