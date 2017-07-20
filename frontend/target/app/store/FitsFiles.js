Ext.define('Target.store.FitsFiles', {
    extend: 'common.store.MyStore',

    alias: 'store.fits-files',

    requires: [
        'Target.model.FitsFiles'
    ],

    model: 'Target.model.FitsFiles',

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/get_fits_files'
    },

    sorters: [
        {
            property: 'tilename',
            direction: 'ASC'
        }
    ]

});
