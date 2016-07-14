/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('Target.view.preview.PreviewModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.preview',

    requires: [
        'Target.model.Object',
        'common.store.Releases',
        'common.store.Tags',
        'common.store.Datasets'
        // 'Target.store.CoaddObjects',

    ],

    links: {
        currentRecord: {
            type: 'Target.model.Object',
            create: true
        }
        // currentCoaddRecord: {
        //     type: 'Target.model.CatalogObject',
        //     create: true
        // }
    },
    stores: {
        // coaddObjects: {
        //     type: 'coadd-objects',
        //     storeId: 'coaddObjects'
        // },
        releases: {
            type: 'releases',
            storeId: 'releases',
            autoLoad: true
        },
        tags: {
            type: 'tags',
            storeId: 'tags',
            autoLoad: true
        },
        datasets: {
            type: 'datasets',
            storeId: 'datasets'
        }
    }
});
