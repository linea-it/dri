Ext.define('visiomatic.store.FitsFiles', {
    extend: 'common.store.MyStore',

    alias: 'store.fits-files',

    requires: [
        'visiomatic.model.FitsFiles'
    ],

    model: 'visiomatic.model.FitsFiles',

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/dataset/desaccess_tile_info_by_id/'
    },

});
