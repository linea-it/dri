Ext.define('Products.store.Band', {
    extend: 'Ext.data.Store',

    alias: 'store.band',
   
    remoteFilter: true,

    remoteSort: true,

    pageSize: 100,
    
    listeners: {
        load: {
            fn: function(store){
                store.insert(0, {
                    id: 10000,
                    filter: "All"
                })
            }
        },
        exception: function(misc) {
            alert("exception!");
        }
    },
    
    proxy: {
        type: 'django',
        url: '/dri/api/filters/'
    }
});
