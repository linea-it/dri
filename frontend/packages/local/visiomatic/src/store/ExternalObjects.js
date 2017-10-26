Ext.define('visiomatic.store.ExternalObjects', {
    extend: 'common.store.MyStore',

    requires: [
        'visiomatic.model.Object'
    ],

    alias: 'store.overlay-external-objects',

    remoteFilter: true,

    remoteSort: false,

    autoLoad: false,

    model: 'visiomatic.model.Object',

    pageSize: 10000,

    proxy: {
        type: 'django',
        timeout: 60000,
        api: {
            read: '/dri/api/vizier/'
        }
    }
});
