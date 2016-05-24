/**
 *
 */
Ext.define('Sky.view.eyeballing.EyeballingModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.eyeballing',

    requires: [
        'Sky.store.Releases',
        'Sky.store.Datasets',
        'Sky.store.Footprints',
        'Sky.store.Surveys',
        'Sky.model.Release',
        'Sky.store.Tags',
        'Sky.model.Dataset'
    ],

    data: {
        release: null
    },

    links: {
        currentRelease: {
            type: 'Sky.model.Release',
            create: true
        },
        currentDataset: {
            type: 'Sky.model.Dataset',
            create: true
        }
    },

    stores: {
        // Releases  = Todos os releases disponiveis.
        releases: {
            type: 'releases',
            storeId: 'Releases',
            autoLoad: false,
            remoteFilter: true
        },
        // Surveys = Imagens que estao disponiveis para um release
        surveys: {
            type: 'surveys'
        },
        // Tags = Tags associados ao Release
        tags: {
            type: 'tags',
            storeId: 'Tags'
        },

        tiles: {
            type: 'footprints',
            pageSize: 0
        }

    }

});
