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
        }
    }
});
