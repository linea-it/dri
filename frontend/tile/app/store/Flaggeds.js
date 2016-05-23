Ext.define('Tile.store.Flaggeds', {
    extend: 'common.store.MyStore',

    requires: [
        'Tile.model.Flagged'
    ],

    alias: 'store.flaggeds',

    model: 'Tile.model.Flagged',

    remoteFilter: true,

    remoteSort: true,

    pageSize: 0,

    proxy: {
        type: 'django',
        url: '/dri/api/flagged/'
    }

});
