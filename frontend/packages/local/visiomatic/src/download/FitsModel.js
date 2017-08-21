Ext.define('visiomatic.download.FitsModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.fits-files',

    requires: [
        'visiomatic.store.FitsFiles',
        'visiomatic.model.FitsFiles'
    ],

    stores: {
        fitsFiles: {
            type: 'fits-files'
        }
    },
});
