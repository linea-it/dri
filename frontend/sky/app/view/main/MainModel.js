/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('Sky.view.main.MainModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.main',

    data: {
        name: 'Sky Viewer',
        internal_name: 'sky_viewer',
        desPortalLogo: 'resources/des-portal-logo.png',
        help_url: 'dri/apps/home/help/help-sky-image-viewer/'
    }

});
