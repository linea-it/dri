Ext.define('Target.view.preview.FitsModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.fits-files',

    requires: [
        'Target.store.FitsFiles',
        'Target.model.FitsFiles'
    ],

    stores: {
        fitsFiles: {
            type: 'fits-files'
        }
    },
});
