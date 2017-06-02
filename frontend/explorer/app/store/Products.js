Ext.define('Explorer.store.Products', {
    extend: 'common.store.MyStore',

    alias: 'store.products',

    requires: [
        'common.data.proxy.Django',
        'Explorer.model.Product'
    ],

    model: 'Explorer.model.Product',

    autoLoad: false,

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/product/'
    }

});
