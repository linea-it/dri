Ext.define('Target.store.FitsFiles', {
    extend: 'common.store.MyStore',

    alias: 'store.tile_files',

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
            property: 'TILENAME',
            direction: 'ASC'
        }
    ]

});
