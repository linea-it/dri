Ext.define('common.store.Releases', {
    extend: 'common.store.MyStore',

    alias: 'store.releases',

    model: 'common.model.Release',

    autoLoad: true,

    remoteSort: true,

    remoteFilter: false,

    proxy: {
        type: 'django',
        url: '/dri/api/releases/'
    },

    sorters: [
        {
            property: 'rls_date',
            direction: 'DESC'
        },
        {
            property: 'rls_display_name',
            direction: 'ASC'
        }
    ]
});
