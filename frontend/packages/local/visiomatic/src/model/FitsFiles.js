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
        {name:'tilename', type:'string', default: null, persist: false},
        {name:'band', type:'string', default: null, persist: false},
        {name:'url', type:'string', default: null, persist: false},
    ]

});
