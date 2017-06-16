Ext.define('Target.view.settings.SettingsModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.settings',

    requires: [
        'Target.store.Settings',
        'Target.model.Setting',
        'Target.store.CurrentSettings',
        'Target.store.ProductDisplayContents',
        'Target.model.CurrentSetting'
    ],

    links: {
        selectedSetting: {
            type: 'Target.model.Setting',
            create: true
        },
        currentSetting: {
            type: 'Target.model.CurrentSetting',
            create: true
        }
    },

    data: {
        currentProduct: null
    },

    stores: {
        settings: {
            type: 'settings'
        },
        currentSettings: {
            type: 'currentsettings'
        },
        displayContents: {
            type: 'product-display-contents',
            autoLoad: false
        }
    }
});
