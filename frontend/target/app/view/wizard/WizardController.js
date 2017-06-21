/**
 *
 */
Ext.define('Target.view.wizard.WizardController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.wizard',

    listen: {
        component: {
            'targets-settings': {
                selectsetting: 'onSelectSetting',
                finish: 'finishWizard'
            },
            'targets-association': {
                activate: 'onActiveAssociation',
                finish: 'finishWizard',
                cancel: 'finishWizard'
            },
            'targets-columns': {
                activate: 'onActiveColumns',
                finish: 'finishWizard'
            },
            'targets-cutout': {
                activate: 'onActiveCutout',
                finish: 'finishWizard'
            },
            'targets-system-members': {
                activate: 'onActiveSystemMembers',
                finish: 'finishWizard'
            },
            'targets-permission': {
                activate: 'onActivePermission',
                finish: 'finishWizard'
            }
        }
    },

    onSelectSetting: function (setting) {
        var me = this,
            vm = me.getViewModel(),
            view = me.getView();

        vm.set('currentSetting', setting);

        view.setCurrentSetting(setting);
    },

    finishWizard: function () {
        var me = this;
        me.getView().fireEvent('finish', me);

    },

    onActiveColumns: function () {
        var me = this,
            vm = me.getViewModel(),
            currentSetting = vm.get('currentSetting'),
            view = me.getView(),
            columns = view.down('targets-columns');

        columns.setCurrentSetting(currentSetting);

    },

    onActiveAssociation: function () {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            view = me.getView(),
            association = view.down('targets-association');

        association.setCatalog(currentCatalog);

    },

    onActiveCutout: function () {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            currentSetting = vm.get('currentSetting'),
            view = me.getView(),
            cutouts = view.down('targets-cutout');

        cutouts.setCurrentCatalog(currentCatalog);
        cutouts.setCurrentSetting(currentSetting);
    },

    onActiveSystemMembers: function () {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            view = me.getView(),
            system = view.down('targets-system-members');

        system.setCurrentCatalog(currentCatalog);

    },

    onActivePermission: function () {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            view = me.getView(),
            permission = view.down('targets-permission');

        permission.setCurrentCatalog(currentCatalog);

    }

});
