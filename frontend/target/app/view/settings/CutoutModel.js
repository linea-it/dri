Ext.define('Target.view.settings.CutoutModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.cutout',

    requires: [
        'Target.model.CutoutJob',
        'Target.store.CutoutJobs',
        'Target.model.CurrentSetting'
    ],

    links: {
        currentCatalog: {
            type: 'Target.model.Catalog',
            create: true
        },
        cutoutJob: {
            type: 'Target.model.CutoutJob',
            create: true
        },
        currentSetting: {
            type: 'Target.model.CurrentSetting',
            create: true
        }
    },

    stores: {
        cutoutjobs: {
            type: 'cutoutjobs'
        }
    }
});
