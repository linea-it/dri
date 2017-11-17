Ext.define('visiomatic.store.Objects', {
    extend: 'common.store.MyStore',

    requires: [
        'visiomatic.model.Object'
    ],

    alias: 'store.overlay-objects',

    remoteFilter: true,

    remoteSort: true,

    autoLoad: false,

    model: 'visiomatic.model.Object',

    pageSize: 5000,

    proxy: {
        type: 'django',
        timeout: 90000,
        api: {
            read    : '/dri/api/catalogobjects/'
        }
    }
});
