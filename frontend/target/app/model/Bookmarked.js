Ext.define('Target.model.Bookmarked', {
    extend: 'Ext.data.Model',

    requires: [
        'common.data.proxy.Django'
    ],

    proxy: {
        type: 'django',
        url: '/dri/api/bookmarked/'
    },

    fields: [
        {name:'id', type:'int', default: null},
        {name:'catalog_id', type:'int'},
        {name:'owner', type:'int'},
        {name:'is_starred', type:'bool'},
    ]

});
