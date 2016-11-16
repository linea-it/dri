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
    listeners: {
        load: {
            fn: function(store){
                store.insert(0, {
                    id: 10000,
                    pgr_display_name: "All"
                })
            }
        },
        
        exception: function(misc) {
            alert("exception!");
        }
    },

    proxy: {
        type: 'django',
        url: '/dri/api/productgroup/'
    }

});