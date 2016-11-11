Ext.define('Target.store.CurrentSettings', {
    extend: 'common.store.MyStore',

    alias: 'store.currentsettings',

    requires: [
        'Target.model.CurrentSetting'
    ],

    model: 'Target.model.CurrentSetting',

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/currentsetting/'
    }

});
