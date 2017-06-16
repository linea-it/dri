Ext.define('Target.model.FilterSet', {
    extend: 'Ext.data.Model',

    requires: [
        'common.data.proxy.Django'
    ],

    proxy: {
        type: 'django',
        url: '/dri/api/filterset/'
    },

    fields: [
        {name:'id', type:'int', default: null, persist: false},
        {name:'product', type:'int'},
        {name:'owner', type:'int', persist: false},
        {name:'fst_name', type:'string'}
    ]

});

