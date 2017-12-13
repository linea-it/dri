/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('Target.view.main.MainModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.main',

    data: {
        name: 'Target Viewer',
        internal_name: 'target_viewer',
        help_url: 'dri/apps/home/help/help-target-viewer/'
    }

});
