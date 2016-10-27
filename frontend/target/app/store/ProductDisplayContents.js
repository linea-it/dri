Ext.define('Target.store.ProductDisplayContents', {
    extend: 'common.store.MyStore',

    alias: 'store.product-display-contents',

    requires: [
        'Target.model.CatalogContent'
    ],

    model: 'Target.model.CatalogContent',

    remoteFilter: true,

    remoteSort: false,

    pageSize: 0,

    proxy: {
        url: '/dri/api/productcontent/get_display_content/'
    },

    autoSort: true

    // sorters: [{
    //     property: 'order',
    //     direction: 'ASC'
    // }]

});
