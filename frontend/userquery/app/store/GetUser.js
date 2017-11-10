Ext.define('UserQuery.store.GetUser', {
    extend: 'common.store.MyStore',
    alternateClassName: 'GetUser',
    alias: 'store.GetUser',

    model: Ext.define('User', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'username', type: 'string'},
            {name: 'id', type: 'int'}
        ]
    }),

    proxy: {
        url: '/dri/api/logged/get_logged/?format=json'
    }
});