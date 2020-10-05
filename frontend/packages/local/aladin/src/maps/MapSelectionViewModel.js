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
        aladin_images_store: {
            type: 'aladin_images',
            autoLoad: false
        }
    },

    data: {
        release: null,
        aladin_last_map_survey: null,
        aladin_last_nonmap_survey: null,
        map_selected: false,
        wait_picker: false,
        current_map: null,
        // Valor Temporario
        map_signal: null,
        overlay_catalog: null
    },

    formulas: {
        aladin_switchable: function (get) {
            return (
                (get('aladin_last_nonmap_survey') != null) &&
                (get('aladin_last_map_survey') != null)
            );
        }
    }
});
