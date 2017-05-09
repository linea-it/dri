Ext.define('Target.view.cutout.CutoutJobModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.cutoutjob',

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
        }
    }
});
