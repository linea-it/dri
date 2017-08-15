Ext.define('aladin.maps.MapSelectionViewModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.mapselection',

    requires: [
        'common.model.Map',
        'common.store.Maps',
    ],

    stores: {
        maps_store: {
            type: 'maps',
            autoLoad: false
        },
        // types_store: {
        //     type: 'maps',
        //     autoLoad: false
        // },
        // classes_store: {
        //     type: 'maps',
        //     autoLoad: false
        // },
        aladin_images_store: {
            type: 'aladin_images',
            autoLoad: false
        }
    },

    data: {
        release: null
    },
});
