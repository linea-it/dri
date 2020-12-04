Ext.define('Target.view.settings.CutoutJobModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.cutoutjob',

    requires: [
        'Target.model.CutoutJob',
        'Target.store.CutoutJobs',
        'Target.store.ProductDisplayContents'
    ],

    data: {
        enableRelease: false,
        currentTag: null,
    },

    links: {
        currentProduct: {
            type: 'Target.model.Catalog',
            create: true
        },
        cutoutJob: {
            type: 'Target.model.CutoutJob',
            create: true
        }
    },

    stores: {
        cutoutjobs: {
            type: 'cutoutjobs'
        },
        tags: {
            fields: ['name', 'displayName'],
            data: [],
        },
        contents: {
            type: 'product-display-contents',
            storeId: 'Contents',
            autoLoad: false
        },
        auxcontents: {
            type: 'product-display-contents',
            autoLoad: false
        }
    }
});
