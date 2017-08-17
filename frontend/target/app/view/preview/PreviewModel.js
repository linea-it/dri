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
        'common.store.Datasets',
        'Target.store.Objects',
        'Target.store.ProductRelateds',
        'Target.model.ProductRelated'
    ],

    data: {
        is_system: false,
        overlayMembers: null
    },

    links: {
        currentRecord: {
            type: 'Target.model.Object',
            create: true
        },
        currentDataset: {
            type: 'common.model.Dataset',
            create: true
        },
        currentCatalog: {
            type: 'Target.model.Catalog',
            create: true
        },
        productRelated: {
            type: 'Target.model.ProductRelated',
            create: true
        }
    },
    stores: {
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
        },
        members: {
            type: 'targets-objects',
            autoLoad: false,
            pageSize: 0
        },
        productRelateds: {
            type: 'product_relateds',
            autoLoad: false
        },
        comments: {
            type: 'comments-position',
            autoLoad: false
        }
    }
});
