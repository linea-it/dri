Ext.define('Target.view.settings.CutoutJobModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.cutoutjob',

    requires: [
        'Target.model.CutoutJob',
        'Target.store.CutoutJobs',
        'Target.store.ProductDisplayContents'
    ],

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
            data: [
                {name: 'y3a2_coadd',  displayName: 'Y3A2 COADD'},
                {name: 'y3a1_coadd',  displayName: 'Y3A1 COADD'},
                {name: 'y3a1_coadd_deep', displayName: 'Y3A1 COADD DEEP'},
                {name: 'y1a1_coadd', displayName: 'Y1A1 COADD'},
                {name: 'y1a1_coadd_d04',  displayName: 'Y1A1 COADD D04'},
                {name: 'y1a1_coadd_d10', displayName: 'Y1A1 COADD D10'},
                {name: 'y1a1_coadd_dfull',  displayName: 'Y1A1 COADD DFULL'},
                {name: 'sva1_coadd', displayName: 'SVA1 COADD'}
            ]
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
