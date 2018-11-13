Ext.define('visiomatic.model.FitsFiles', {
    extend: 'Ext.data.Model',

    requires: [
        'common.data.proxy.Django'
    ],

    proxy: {
        type: 'django',
        url: '/dri/api/get_fits_by_tilename'
    },

    fields: [
        {name:'filename', type:'string', default: null, persist: false},
        {name:'filter', type:'string', default: null, persist: false},
        {name:'order', type:'int', default: null, persist: false},
        {name:'file_source', type:'string', default: null, persist: false},
    ]

});
