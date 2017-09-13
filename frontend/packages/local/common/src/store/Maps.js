Ext.define('common.store.Maps', {
    extend: 'common.store.MyStore',

    alias: 'store.maps',

    requires: [
        'common.data.proxy.Django',
        'common.model.Map'
    ],

    model: 'common.model.Map',

    autoLoad: false,
    pageSize: 0,
    remoteFilter: true,

    proxy: {
        type: 'django',
        url: '/dri/api/map/'
    },
});
