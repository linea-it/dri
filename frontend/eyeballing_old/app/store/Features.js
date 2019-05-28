Ext.define('Eyeballing.store.Features', {
    extend: 'common.store.MyStore',

    requires: [
        'Eyeballing.model.Feature'
    ],

    alias: 'store.features',

    model: 'Eyeballing.model.Feature',

    remoteFilter: true,

    remoteSort: true,

    autoLoad: true,

    pageSize: 0,

    proxy: {
        type: 'django',
        url: '/dri/api/feature/'
    }

});
