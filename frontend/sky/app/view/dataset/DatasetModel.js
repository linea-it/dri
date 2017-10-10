/**
 *
 */
Ext.define('Sky.view.dataset.DatasetModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.dataset',

    requires: [
        'common.data.proxy.Django',
        'Sky.model.Release',
        'Sky.model.Tag',
        'Sky.model.Dataset'
    ],

    data: {
        dataset: null,

        disablecompare: true

    },

    links: {
        currentRelease: {
            type: 'Sky.model.Release',
            create: true
        },
        currentTag: {
            type: 'Sky.model.Tag',
            create: true
        },
        currentDataset: {
            type: 'Sky.model.Dataset',
            create: true
        }
    },

    stores: {
        // Datasets = Tiles que estao nos tags de um release
        datasets: {
            type: 'datasets'
        },

        compare: {
            type: 'datasets',
            storeId: 'compare',
            autoLoad: false
        }

    }

});
