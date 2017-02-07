Ext.define('Target.store.Permissions', {
    extend: 'common.store.MyStore',

    alias: 'store.permissions',

    requires: [
        'Target.model.Permission'
    ],

    model: 'Target.model.Permission',

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/product_permission/'
    }

});
