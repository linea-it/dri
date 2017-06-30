Ext.define('Target.store.TileFiles', {
    extend: 'common.store.MyStore',

    alias: 'store.tile_files',

    requires: [
        'Target.model.TileFiles'
    ],

    model: 'Target.model.TileFiles',

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/get_tiles'
    },

    sorters: [
        {
            property: 'TILENAME',
            direction: 'ASC'
        }
    ]

});
