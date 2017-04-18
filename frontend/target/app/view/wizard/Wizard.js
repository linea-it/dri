/**
 *
 */
Ext.define('Target.view.wizard.Wizard', {
    extend: 'Ext.tab.Panel',

    xtype: 'targets-wizard',

    requires: [
        'Target.view.wizard.WizardController',
        'Target.view.wizard.WizardModel',
        'Ext.layout.container.Card',
        'Target.view.settings.Settings',
        'Target.view.association.Panel',
        'Target.view.settings.Columns',
        'Target.view.settings.Permission',
        'Ext.layout.container.Card'
    ],

    controller: 'wizard',

    viewModel: 'wizard',

    //layout: 'card',

    defaultListenerScope: true,

    config: {
        product: null,
        currentSetting: null,
        currentCatalog: null
    },

    ui: 'navigation',
    tabPosition: 'left',
    tabRotation: 0,

    items: [
        {
            id: 'card-0',
            xtype: 'targets-association',
            title: 'Association',
            disabled: true
        },
        {
            id: 'card-1',
            xtype: 'targets-settings',
            title: 'Setting',
            bind: {
                product: '{product}'
            }
        },
        {
            id: 'card-2',
            xtype: 'targets-columns',
            title: 'Columns',
            disabled: true
        },
        {
            id: 'card-3',
            xtype: 'targets-permission',
            title: 'Permission',
            disabled: true
        }
    ],

    setProduct: function (product) {
        var me = this,
            vm = me.getViewModel();

        this.product = product;

        vm.set('product', product);
    },

    setCurrentSetting: function (currentSetting) {
        var me = this;

        me.currentSetting = currentSetting;

        me.getViewModel().set('currentSetting', currentSetting);

        me.down('targets-settings').setCurrentSetting(currentSetting);

        me.enableTabs();

    },

    setCurrentCatalog: function (currentCatalog) {
        var me = this;

        me.currentCatalog = currentCatalog;

        me.getViewModel().set('currentCatalog', currentCatalog);

    },

    showNext: function () {
        this.doCardNavigation(1);
    },

    showPrevious: function () {
        this.doCardNavigation(-1);
    },

    doCardNavigation: function (incr) {
        var me = this,
            l = me.getLayout(),
            i = l.activeItem.id.split('card-')[1],
            next = parseInt(i, 10) + incr;

        l.setActiveItem(next);

        // me.down('#card-prev').setDisabled(next === 0);
        // me.down('#card-next').setDisabled(next === 2);
    },

    enableTabs: function () {
        var me = this,
            vm = me.getViewModel(),
            currentSetting = vm.get('currentSetting');

        if ((currentSetting.get('id') > 0) && (currentSetting.get('editable'))) {
            me.down('targets-association').enable();
            me.down('targets-columns').enable();
            me.down('targets-permission').enable();

        } else {
            me.down('targets-association').disable();
            me.down('targets-columns').disable();
            me.down('targets-permission').disable();
        }

    }

});

