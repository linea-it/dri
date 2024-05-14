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
        'Target.view.association.Panel',
        'Target.view.settings.Columns',
        'Target.view.settings.Permission',
        'Target.view.settings.SystemMembers',
        'Target.view.settings.Cutout',
        'Ext.layout.container.Card'
    ],

    controller: 'wizard',

    viewModel: 'wizard',

    defaultListenerScope: true,

    config: {
        product: null,
        currentSetting: null,
        currentCatalog: null
    },

    ui: 'navigation',
    tabPosition: 'left',
    tabRotation: 0,
    defaults: {
        textAlign: 'left'
    },

    items: [
        {
            id: 'card-1',
            xtype: 'targets-columns',
            title: 'Columns',
            iconCls: 'x-fa fa-list'
        },
        {
            id: 'card-2',
            xtype: 'targets-association',
            title: 'Association',
            iconCls: 'x-fa fa-columns',
            disabled: true
        },
        {
            id: 'card-4',
            xtype: 'targets-system-members',
            title: 'System Members',
            iconCls: 'x-fa fa-dot-circle-o',
            // Disabled System Members Settings Issue: https://github.com/linea-it/dri/issues/1474
            hidden: true
        },
        {
            id: 'card-5',
            xtype: 'targets-permission',
            title: 'Permission',
            iconCls: 'x-fa fa-lock',
            disabled: true
        },
    ],

    setProduct: function (product) {
        var me = this,
            vm = me.getViewModel();

        this.product = product;

        vm.set('product', product);
    },

    setCurrentCatalog: function (currentCatalog) {
        var me = this;

        me.currentCatalog = currentCatalog;

        me.getViewModel().set('currentCatalog', currentCatalog);

        me.enableTabsByPermission();

    },

    enableTabsByPermission: function () {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog');

        // Configuracoes habilitadas se o usuario for o proprietario do catalogo
        if ((currentCatalog.get('id') > 0) && (currentCatalog.get('is_owner'))) {
            me.down('targets-association').enable();
            me.down('targets-permission').enable();
            me.down('targets-system-members').enable();

        } else {
            me.down('targets-association').disable();
            me.down('targets-permission').disable();
            me.down('targets-system-members').disable();

        }

        if (currentCatalog.get('pcl_is_system')) {
            me.down('targets-system-members').enable();
        } else {
            me.down('targets-system-members').disable();
        }
    }

});
