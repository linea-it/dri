Ext.define('UserQuery.store.Queries', {
    extend: 'common.store.MyStore',

    alias: 'store.queries',

    requires: [
        'UserQuery.model.Query'
    ],

    model: 'UserQuery.model.Query',

    remoteFilter: true,

    remoteSort: true,

    pageSize: 100,

    proxy: {
        url: '/dri/api/userquery_query/'
    },

    sorters: [
        {
            property: 'creation_date',
            direction: 'DESC'
        }
    ]

});
