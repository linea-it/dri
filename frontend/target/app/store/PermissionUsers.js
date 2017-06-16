Ext.define('Target.store.PermissionUsers', {
    extend: 'common.store.MyStore',

    alias: 'store.permission_users',

    requires: [
        'Target.model.PermissionUser'
    ],

    model: 'Target.model.PermissionUser',

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/product_permission_user/'
    },

    sorters: [
        {
            property: 'prm_user__username',
            direction: 'ASC'
        }
    ]

});
