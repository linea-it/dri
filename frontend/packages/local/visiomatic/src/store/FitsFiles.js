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
        url: '/dri/api/get_fits_by_tilename'
    },

    sorters: [
        {
            property: 'tilename',
            direction: 'ASC'
        }
    ]

});
