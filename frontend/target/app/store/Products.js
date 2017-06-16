Ext.define('Target.store.Products', {
    extend: 'common.store.MyStore',

    alias: 'store.products',

    requires: [
        'common.data.proxy.Django',
        'Target.model.Product'
    ],

    model: 'Target.model.Product',

    autoLoad: false,

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/product/'
    }

});
