Ext.define('UserQuery.model.Query', {
    extend: 'Ext.data.Model',
    requires: [
        'common.data.proxy.Django'
    ],
    proxy: {
        type: 'django',
        url: '/dri/api/userquery_query/'
    },

    fields: [
        { name: 'id', type: 'int', persist: false },
        { name: 'release', type: 'int' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'sql_sentence', type: 'string', default: '' },
        { name: 'is_public', type: 'boolean', default: false },

        { name: 'creation_date', type: 'date', persist: false },
        { name: 'last_edition_date', type: 'date', persist: false },

        { name: 'owner', type: 'string', persist: false },
    ]
});