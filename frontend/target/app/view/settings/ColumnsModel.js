Ext.define('Target.view.settings.ColumnsModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.columns',

    requires: [
        'Target.model.CurrentSetting',
        'Target.store.ProductDisplayContents',
        'Target.store.ContentSettings'
    ],

    links: {
        currentSetting: {
            type: 'Target.model.CurrentSetting',
            create: true
        }
    },

    stores: {
        currentSettings: {
            type: 'currentsettings'
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
