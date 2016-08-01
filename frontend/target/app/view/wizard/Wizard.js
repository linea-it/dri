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
        'Target.view.association.Panel'
    ],

    controller: 'wizard',

    viewModel: 'wizard',

    layout: 'card',

    defaultListenerScope: true,

    items: [
        {
            id: 'card-0',
            xtype: 'targets-association',
            title: 'Panel 1'
        },
        {
            id: 'card-1',
            xtype: 'panel',
            title: 'Panel 2'
        },
        {
            id: 'card-2',
            xtype: 'panel',
            title: 'Panel 3'
        }
    ],

    bbar: ['->',
        {
            itemId: 'card-prev',
            text: '&laquo; Previous',
            handler: 'showPrevious',
            disabled: true
        },
        {
            itemId: 'card-next',
            text: 'Next &raquo;',
            handler: 'showNext'
        }
    ],

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

