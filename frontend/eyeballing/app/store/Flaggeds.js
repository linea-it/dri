Ext.define('Eyeballing.store.Flaggeds', {
    extend: 'common.store.MyStore',

    requires: [
        'Eyeballing.model.Flagged'
    ],

    alias: 'store.flaggeds',

    model: 'Eyeballing.model.Flagged',

    remoteFilter: true,

    remoteSort: true,

    pageSize: 0,

    proxy: {
        type: 'django',
        url: '/dri/api/flagged/'
    }

});
