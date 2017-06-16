/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('Target.view.home.HomeModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.home',

    requires: [
        'Target.store.CatalogsTree'
    ],

    data: {
        release: 0,
        field: 0
    }
});
