Ext.define('Target.store.ClassContent', {
    extend: 'common.store.MyStore',

    alias: 'store.class-content',

    requires: [
        'Target.model.CatalogColumn'
    ],

    model: 'Target.model.CatalogColumn',

    remoteFilter: true,

    proxy: {
        url: '/dri/api/productclasscontent/'
    }

});
