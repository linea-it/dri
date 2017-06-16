Ext.define('Target.store.ProductRelateds', {
    extend: 'common.store.MyStore',

    alias: 'store.product_relateds',

    requires: [
        'common.data.proxy.Django',
        'Target.model.ProductRelated'
    ],

    model: 'Target.model.ProductRelated',

    autoLoad: false,

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/productrelated/'
    }

});
