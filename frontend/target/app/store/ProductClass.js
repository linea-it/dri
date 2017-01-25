Ext.define('Target.store.ProductClass', {
    extend: 'common.store.MyStore',

    alias: 'store.product_class',

    requires: [
        'common.data.proxy.Django'
    ],

    autoLoad: false,

    remoteFilter: false,

    pageSize: 0,

    proxy: {
        url: '/dri/api/productclass/'
    },

    fields: [
        {name:'id'},
        {name:'pcl_name', type:'string'},
        {name:'pcl_display_name', type:'string'},
        {name:'pcl_is_system', type:'boolean'},
        {name:'pgr_name', type:'string'}
    ]

});
