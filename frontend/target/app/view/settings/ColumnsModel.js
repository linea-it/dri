Ext.define('Target.view.settings.ColumnsModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.columns',

    requires: [
        'Target.model.Catalog',
        'Target.model.CurrentSetting',
        'Target.store.ProductDisplayContents',
        'Target.store.ContentSettings'
    ],

    links: {
        selectedSetting: {
            type: 'Target.model.Setting',
            create: true
        },
        currentSetting: {
            type: 'Target.model.CurrentSetting',
            create: true
        },
        currentCatalog: {
            type: 'Target.model.Catalog',
            create: true
        }
    },

    stores: {
        settings: {
            type: 'settings',
            storeId: 'Settings'
        },
        currentSettings: {
            type: 'currentsettings',
            remoteFilter: true
        },
        availableContents: {
            type: 'product-display-contents',
            autoLoad: false,
            storeId: 'Available'
        },
        auxAvailableContents: {
            type: 'product-display-contents',
            autoLoad: false
        },
        contentSettings: {
            type: 'content-settings',
            autoLoad: false
        },
        auxContentSettings: {
            type: 'content-settings',
            autoLoad: false
        }
    }
});
