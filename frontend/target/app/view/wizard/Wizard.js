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
        'Ext.layout.container.Card'
    ],

    controller: 'wizard',

    viewModel: 'wizard',

    //layout: 'card',

    defaultListenerScope: true,

    config: {
        product: null,
        currentSetting: null
    },

    ui: 'navigation',
    tabPosition: 'left',
    tabRotation: 0,

    items: [
        {
            id: 'card-0',
            xtype: 'targets-settings',
            title: 'Setting',
            bind: {
                product: '{product}'
            }
        },
        {
            id: 'card-1',
            xtype: 'targets-association',
            title: 'Association',
            disabled: true
        },
        {
            id: 'card-2',
            xtype: 'targets-columns',
            title: 'Columns',
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

        } else {
            me.down('targets-association').disable();
            me.down('targets-columns').disable();
        }

    }

});

