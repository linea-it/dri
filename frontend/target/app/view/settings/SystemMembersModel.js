Ext.define('Target.view.settings.SystemMembersModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.system_members',

    requires: [
        'Target.model.Catalog',
        'Target.store.Products'
    ],

    links: {
        currentCatalog: {
            type: 'Target.model.Catalog',
            create: true
        }
    },

    stores: {
        products: {
            type: 'products',
            autoLoad: false
        }

    }
});
