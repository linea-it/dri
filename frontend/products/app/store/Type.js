Ext.define('Products.store.Type', {
    extend: 'common.store.Tiles',

    /**
     * @requires common.model.Dataset
     */
    

    alias: 'store.type',

    // model: 'common.model.Dataset',

    remoteFilter: true,

    remoteSort: true,

    pageSize: 100,

    proxy: {
        type: 'django',
        url: '/dri/api/productgroup/'
    }

});