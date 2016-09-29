Ext.define('Products.store.Band', {
    extend: 'Ext.data.Store',

    alias: 'store.band',
   
    remoteFilter: true,

    remoteSort: true,

    pageSize: 100,

    proxy: {
        type: 'django',
        url: '/dri/api/filters/'
    }
});
