/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('Catalogs.view.main.MainModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.main',
    

    requires: [
        'Catalogs.model.catalogtree',
        'Catalogs.store.treestore'
    ],

    stores: {
        catalogs: {
            type: 'treestore'

        }
    },

    data: {
        name: 'Catalogs',
        desPortalLogo: 'resources/des-portal-logo.png'
        
    }

    //TODO - add data, formulas and/or methods to support your view
});
