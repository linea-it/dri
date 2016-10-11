Ext.define('Target.view.settings.SettingsModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.settings',

    requires: [
        'Target.store.Settings',
        'Target.model.Setting'
    ],

    links: {
        currentSetting: {
            type: 'Target.model.Setting',
            create: true
        }
    },

    data: {
        currentProduct: null
    },

    stores: {
        catalogs: {
            type: 'settings'
        }
    }
});
