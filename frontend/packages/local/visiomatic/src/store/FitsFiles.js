Ext.define('visiomatic.store.FitsFiles', {
    extend: 'common.store.MyStore',

    alias: 'store.fits-files',

    requires: [
        'visiomatic.model.FitsFiles'
    ],

    model: 'visiomatic.model.FitsFiles',

    remoteFilter: false,

    pageSize: 0,

});
