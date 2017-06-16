Ext.define('Target.store.Workgroups', {
    extend: 'common.store.MyStore',

    requires: [
        'Target.model.Workgroup'
    ],

    alias: 'store.workgroups',

    model: 'Target.model.Workgroup',

    remoteFilter: false,

    pageSize: 0,

    proxy: {
        url: '/dri/api/workgroup/'
    }

});
