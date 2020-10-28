Ext.define('common.store.Databases', {
    extend: 'common.store.MyStore',

    alias: 'store.databases',

    model: 'common.model.Database',

    autoLoad: true,

    remoteSort: false,

    remoteFilter: false,

    proxy: {
        type: 'django',
        url: '/dri/api/available_database/'
    },

    sorters: [
        {
            property: 'display_name',
            direction: 'ASC'
        },
    ]
});
