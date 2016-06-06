/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('Target.view.preview.PreviewModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.preview',

    requires: [
        'Target.model.CatalogObject',
        'Target.store.CoaddObjects',
        'common.store.Tiles'
    ],

    links: {
        currentRecord: {
            type: 'Target.model.CatalogObject',
            create: true
        },
        currentCoaddRecord: {
            type: 'Target.model.CatalogObject',
            create: true
        }
    },
    stores: {
        coaddObjects: {
            type: 'coadd-objects',
            storeId: 'coaddObjects'
        },
        tiles: {
            type: 'tiles',
            storeId: 'tiles'
        }
    }
});
