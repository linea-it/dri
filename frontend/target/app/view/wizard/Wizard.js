/**
 *
 */
Ext.define('Target.view.wizard.Wizard', {
    extend: 'Ext.panel.Panel',

    xtype: 'targets-wizard',

    requires: [
        'Target.view.wizard.WizardController',
        'Target.view.wizard.WizardModel',
        'Ext.layout.container.Card',
        'Target.view.settings.Settings',
        'Target.view.association.Panel'
    ],

    controller: 'wizard',

    viewModel: 'wizard',

    layout: 'card',

    defaultListenerScope: true,

    config: {
        product: null
    },

    items: [
        {
            id: 'card-0',
            xtype: 'targets-settings',
            title: 'Settings',
            bind: {
                product: '{product}'
            }
        },
        {
            id: 'card-1',
            xtype: 'targets-association',
            title: 'Association'
            // bind: {
            //     product: '{product}'
            // }
        }
        // {
        //     id: 'card-1',
        //     xtype: 'panel',
        //     title: 'Panel 2'
        // },
        // {
        //     id: 'card-2',
        //     xtype: 'panel',
        //     title: 'Panel 3'
        // }
    ],

    bbar: ['->'
        // {
        //     itemId: 'card-prev',
        //     text: '&laquo; Previous',
        //     handler: 'showPrevious',
        //     disabled: true
        // },
        // {
        //     itemId: 'card-next',
        //     text: 'Next &raquo;',
        //     handler: 'showNext'
        // }
    ],

    setProduct: function (product) {
        var me = this,
            vm = me.getViewModel();

        this.product = product;

        vm.set('product', product);
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

        me.down('#card-prev').setDisabled(next === 0);
        me.down('#card-next').setDisabled(next === 2);
    }

});

