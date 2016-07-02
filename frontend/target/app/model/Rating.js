Ext.define('Target.model.Rating', {
    extend: 'Ext.data.Model',

    requires: [
        'common.data.proxy.Django'
    ],

    proxy: {
        type: 'django',
        url: '/dri/api/objectsrating/',
        // reader: {
        //     type: 'json',
        //     rootProperty: 'children'
        // }
    },

    fields: [
        {name:'id'},
        {name:'catalog_id', type:'int'},
        {name:'owner', type:'int'},
        {name:'object_id', type:'int'},
        {name:'rating', type:'int'}
    ]

});

