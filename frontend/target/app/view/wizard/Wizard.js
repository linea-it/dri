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
            id: 'card-0',
            xtype: 'targets-settings',
            title: 'Setting',
            iconCls: 'x-fa fa-cog',
            bind: {
                product: '{product}'
            }
        },
        {
            id: 'card-1',
            xtype: 'targets-columns',
            title: 'Columns',
            iconCls: 'x-fa fa-list',
            disabled: true
        },
        {
            id: 'card-2',
            xtype: 'targets-association',
            title: 'Association',
            iconCls: 'x-fa fa-columns',
            disabled: true
        },
        {
            id: 'card-3',
            xtype: 'targets-cutout',
            title: 'Cutouts',
            iconCls: 'x-fa fa-picture-o'
        },
        {
            id: 'card-4',
            xtype: 'targets-system-members',
            title: 'System Members',
            iconCls: 'x-fa fa-dot-circle-o',
            disabled: true
        },
        {
            id: 'card-5',
            xtype: 'targets-permission',
            title: 'Permission',
            iconCls: 'x-fa fa-lock',
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

        me.enableTabsBySettings();

    },

    setCurrentCatalog: function (currentCatalog) {
        var me = this;

        me.currentCatalog = currentCatalog;

        me.getViewModel().set('currentCatalog', currentCatalog);

        me.enableTabsByPermission();

    },

    enableTabsBySettings: function () {
        var me = this,
            vm = me.getViewModel(),
            currentSetting = vm.get('currentSetting');


        // Configuracoes por settings caso o usuario tenha selecionado uma
        // setting habilitar os paineis
        if ((currentSetting.get('id') > 0) && (currentSetting.get('editable'))) {
            me.down('targets-columns').enable();

        } else {
            me.down('targets-columns').disable();

        }

    },

    enableTabsByPermission: function () {
        var me = this,
        vm = me.getViewModel(),
        currentCatalog = vm.get('currentCatalog');

        // Configuracoes habilitadas se o usuario for o proprietario do catalogo
        // if ((currentCatalog.get('id') > 0) && (currentCatalog.get('is_owner'))) {
        me.down('targets-association').enable();
        me.down('targets-permission').enable();
        // me.down('targets-system-members').enable();

        // } else {
        //     me.down('targets-association').disable();
        //     me.down('targets-permission').disable();
        //     me.down('targets-system-members').disable();

        // }

        if (currentCatalog.get('pcl_is_system')) {
            me.down('targets-system-members').enable();
        } else {
            me.down('targets-system-members').disable();
        }
    }

});

