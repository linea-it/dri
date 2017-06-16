Ext.define('Target.store.PermissionWorkgroups', {
    extend: 'common.store.MyStore',

    alias: 'store.permission_workgroups',

    requires: [
        'Target.model.PermissionWorkgroup'
    ],

    model: 'Target.model.PermissionWorkgroup',

    remoteFilter: true,

    remoteSorter: false,

    pageSize: 0,

    proxy: {
        url: '/dri/api/product_permission_workgroup_user/'
    },

    groupField: 'workgroup',

    sorters: [
        // {
        //     property: 'workgroup',
        //     direction: 'ASC'
        // },
        {
            property: 'username',
            direction: 'ASC'
        }
    ]

});
