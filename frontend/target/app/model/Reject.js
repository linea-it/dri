Ext.define('Target.model.Reject', {
    extend: 'Ext.data.Model',

    requires: [
        'common.data.proxy.Django'
    ],

    proxy: {
        type: 'django',
        url: '/dri/api/objectsreject/'
    },

    fields: [
        {name:'id'},
        {name:'catalog_id', type:'int'},
        {name:'owner', type:'int'},
        {name:'object_id', type:'int'},
        {name:'reject', type: 'boolean'}
    ]

});

