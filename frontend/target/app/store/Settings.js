Ext.define('Target.store.Settings', {
    extend: 'common.store.MyStore',

    alias: 'store.settings',

    requires: [
        'Target.model.Setting'
    ],

    model: 'Target.model.Setting',

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/productsettings/'
    }

});
