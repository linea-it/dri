Ext.define('Explorer.store.Objects', {
    extend: 'common.store.MyStore',

    alias: 'store.objects',

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
