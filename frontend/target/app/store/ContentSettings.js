Ext.define('Target.store.ContentSettings', {
    extend: 'common.store.MyStore',

    alias: 'store.content-settings',

    requires: [
        'Target.model.ContentSetting'
    ],

    model: 'Target.model.ContentSetting',

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/contentsetting/'
    }

});
