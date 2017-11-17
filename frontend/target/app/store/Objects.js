Ext.define('Target.store.Objects', {
    extend: 'common.store.MyStore',

    requires: [
        'Target.model.Object'
    ],

    alias: 'store.targets-objects',

    remoteFilter: true,

    remoteSort: true,

    autoLoad: false,

    model: 'Target.model.Object',

    pageSize: 100,

    proxy: {
        type: 'django',
        timeout: 180000, // 3 minutos de timeout
        api: {
            read    : '/dri/api/target/'
        }
    }
});
