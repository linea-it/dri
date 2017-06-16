Ext.define('common.store.Fields', {
    extend: 'common.store.MyStore',

    model: 'common.model.Field',

    alias: 'store.fields',

    autoLoad: true,

    // remoteFilter: true,

    proxy: {
        type: 'ajax',
        url: '/PRJSUB/TileViewer/getFields',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    },

    sorters: [{
         property: 'field_name',
         direction: 'ASC'
    }],

    listeners: {

        beforeload: function(store) {

            if (store.isFiltered()){

                filters = store.filters;

                filters.each( function(filter){

                    if (filter.getProperty() == "tag_id"){
                        if (filter.getValue() == null){
                            return false;
                        }
                    }

                }, this);
            }
        }
    }
});
