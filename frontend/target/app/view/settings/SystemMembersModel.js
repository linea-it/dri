Ext.define('Target.view.settings.SystemMembersModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.system_members',

    requires: [
        'Target.model.Catalog',
        'Target.store.Products',
        'Target.store.ProductDisplayContents',
        'Target.model.CatalogContent',
        'Target.store.ProductRelateds',
        'Target.model.ProductRelated'
    ],

    links: {
        currentCatalog: {
            type: 'Target.model.Catalog',
            create: true
        },
        productRelated: {
            type: 'Target.model.ProductRelated',
            create: true
        },
        membersCatalog: {
            type: 'Target.model.Catalog',
            create: true
        },
        crossIdentification: {
            type: 'Target.model.CatalogContent',
            create: true
        }
    },

    stores: {
        products: {
            type: 'products',
            autoLoad: false
        },
        productRelateds: {
            type: 'product_relateds',
            autoLoad: false
        },
        availableContents: {
            type: 'product-display-contents',
            autoLoad: false
        }
    }
});
