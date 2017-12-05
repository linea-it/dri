/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('Sky.view.home.HomeModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.home',

    stores: {

        releases: {
            type: 'releases',
            remoteFilter: true,
            storeId: 'releases'
        }
    }

});
