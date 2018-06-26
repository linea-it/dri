/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('CatalogBuilder.view.main.MainModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.main',

    data: {
        name: 'Catalog Builder',
        internal_name: 'user_query',
        desPortalLogo: 'resources/des-portal-logo.png',
        help_url: 'dri/apps/home/help/help-user-query/'
    }

});
