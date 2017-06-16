Ext.define('Explorer.store.CoaddObject', {
    extend: 'common.store.MyStore',

    alias: 'store.coaddobject',

    requires: [
        'common.data.proxy.Django'
    ],

    autoLoad: false,

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/coadd_objects/'
    }

});
