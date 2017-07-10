Ext.define('Target.model.FitsFiles', {
    extend: 'Ext.data.Model',

    requires: [
        'common.data.proxy.Django'
    ],

    proxy: {
        type: 'django',
        url: '/dri/api/get_tiles'
    },

    fields: [
        {name:'TILENAME', type:'string', default: null, persist: false},
        {name:'image_src_fits', type:'string', default: null, persist: false},
        {name:'ARCHIVE_PATH', type:'string', default: null, persist: false},
        {name:'CREATED_DATE', type:'string', default: null, persist: false},
        {name:'image_src_ptif', type:'string', default: null, persist: false},
        {name:'FILENAME', type:'string', default: null, persist: false},
    ]

});
