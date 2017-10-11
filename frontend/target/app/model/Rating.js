Ext.define('Target.model.Rating', {
    extend: 'Ext.data.Model',

    requires: [
        'common.data.proxy.Django'
    ],

    proxy: {
        type: 'django',
        url: '/dri/api/objectsrating/'
    },

    fields: [
        {name:'id', type:'int', default: null},
        {name:'catalog_id', type:'int'},
        {name:'owner', type:'int'},
        {name:'object_id', type:'string'},
        {name:'rating', type:'int'}
    ]

});
