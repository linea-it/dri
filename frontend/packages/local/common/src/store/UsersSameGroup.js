Ext.define('common.store.UsersSameGroup', {
    extend: 'common.store.MyStore',

    alias: 'store.users_same_group',

    autoLoad: false,

    remoteSort: false,

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/users_same_group/'
    },

    sorters: [
        {
            property: 'username',
            direction: 'ASC'
        }
    ],

    fields: ['id', 'username']
});
