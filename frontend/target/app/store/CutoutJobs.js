Ext.define('Target.store.CutoutJobs', {
    extend: 'common.store.MyStore',

    alias: 'store.cutoutjobs',

    requires: [
        'Target.model.CutoutJob'
    ],

    model: 'Target.model.CutoutJob',

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/cutoutjob/'
    }

});
