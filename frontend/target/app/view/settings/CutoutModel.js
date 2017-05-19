Ext.define('Target.view.settings.CutoutModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.cutout',

    requires: [
        'Target.model.CutoutJob',
        'Target.store.CutoutJobs'
    ],

    links: {
        currentCatalog: {
            type: 'Target.model.Catalog',
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
                {name: 'y3a1_coadd',  displayName: 'Y3A1 COADD'},
                {name: 'y1a1_coadd', displayName: 'Y1A1 COADD'},
                {name: 'y1a1_coadd_d04',  displayName: 'Y1A1 COADD D04'},
                {name: 'y1a1_coadd_d10', displayName: 'Y1A1 COADD D10'},
                {name: 'y1a1_coadd_dfull',  displayName: 'Y1A1 COADD DFULL'},
                {name: 'sva1_coadd', displayName: 'SVA1 COADD'}
            ]
        }
    }
});
