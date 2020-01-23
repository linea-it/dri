/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('visiomatic.contrast.ContrastViewModel', {
    extend: 'Ext.app.ViewModel',

    requires: [
        'common.model.Dataset'
    ],

    alias: 'viewmodel.contrastoverlay',

    data: {
        contrast: {
            contrast: 'normal'
        }
    },

    links: {
        dataset: {
            type: 'common.model.Dataset',
            create: true
        }
    }
});
