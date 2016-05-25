Ext.define('Tile.store.Defects', {
    extend: 'common.store.MyStore',

    requires: [
        'Tile.model.Defect'
    ],

    alias: 'store.defects',

    model: 'Tile.model.Defect',

    remoteFilter: true,

    remoteSort: true,

    pageSize: 0,

    proxy: {
        type: 'django',
        url: '/dri/api/defect/'
    }

});
