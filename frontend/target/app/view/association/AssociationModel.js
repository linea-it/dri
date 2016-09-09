Ext.define('Target.view.association.AssociationModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.association',

    requires: [
        'Target.store.ClassContent',
        'Target.store.ProductContent',
        'Target.store.ProductAssociation',
        'Target.store.Association'
    ],

    links: {
        currentCatalog: {
            type: 'Target.model.Catalog',
            create: true
        }
    },

    stores: {
        classcontent: {
            type: 'class-content',
            storeId: 'ClassContent'
        },
        auxclasscontent: {
            type: 'class-content',
            storeId: 'AuxClassContent'
        },
        productcontent: {
            type: 'product-content',
            storeId: 'ProductContent'
        },

        productassociation: {
            type: 'product-association',
            storeId: 'ProductAssociation'
        },

        fakeassociation: {
            type: 'product-association',
            remoteFilter: false,
            remoteSorter: false

        }
    }
});
