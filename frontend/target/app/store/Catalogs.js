Ext.define('Target.store.Catalogs', {
    extend: 'common.store.MyStore',

    alias: 'store.catalogs',

    requires: [
        'common.data.proxy.Django',
        'Target.model.Catalog'
    ],

    model: 'Target.model.Catalog',

    autoLoad: false,

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/catalog/'
    }

});
