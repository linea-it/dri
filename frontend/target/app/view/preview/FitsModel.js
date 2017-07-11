Ext.define('Target.view.preview.FitsModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.fits_files',

    requires: [
        'Target.store.FitsFiles',
        'Target.model.FitsFiles'
    ],

    stores: {
        fits_files: {
            type: 'fits_files'
        }
    },
});
