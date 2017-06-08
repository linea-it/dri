Ext.define('Explorer.store.Association', {
    extend: 'common.store.MyStore',

    alias: 'store.association',

    requires: [
        'Explorer.model.Association'
    ],

    model: 'Explorer.model.Association',

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/association/'
    }

});
