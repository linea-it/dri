Ext.define('Tile.store.Features', {
    extend: 'common.store.MyStore',

    requires: [
        'Tile.model.Feature'
    ],

    alias: 'store.features',

    model: 'Tile.model.Feature',

    remoteFilter: true,

    remoteSort: true,

    autoLoad: true,

    pageSize: 0,

    proxy: {
        type: 'django',
        url: '/dri/api/feature/'
    }

});
