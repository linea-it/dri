/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('Target.view.wizard.WizardModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.wizard',

    requires: [
        'Target.model.Catalog',
        'Target.store.ProductContent',
        'Target.store.ProductAssociation',
        'Target.model.CurrentSetting'
    ],

    stores: {
        productcontent: {
            type: 'product-content',
            storeId: 'ProductContent'
        },
        productassociation: {
            type: 'product-association',
            storeId: 'ProductAssociation'
        }
    },

    links: {
        currentCatalog: {
            type: 'Target.model.Catalog',
            create: true
        },
        currentSetting: {
            type: 'Target.model.CurrentSetting',
            create: true
        }
    },

    data: {
        product: null
    }
});
