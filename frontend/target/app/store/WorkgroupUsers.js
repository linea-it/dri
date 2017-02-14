Ext.define('Target.store.WorkgroupUsers', {
    extend: 'common.store.MyStore',

    requires: [
        'Target.model.WorkgroupUser'
    ],

    alias: 'store.workgroup_users',

    model: 'Target.model.WorkgroupUser',

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/workgroup_users/'
    }

});
