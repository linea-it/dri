/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('UserQuery.view.main.MainModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.main',

    data: {
        name: 'User Query',
        internal_name: 'user_query',
        desPortalLogo: 'resources/des-portal-logo.png',
        help_url: 'contact-us/',
        sql_value: ''
    }

});
