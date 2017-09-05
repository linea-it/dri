/**
 *
 */
Ext.define('Target.view.wizard.WizardController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.wizard',

    listen: {
        component: {
            'targets-columns': {
                activate: 'onActiveColumns',
                finish: 'finishWizard'
            },
            'targets-association': {
                activate: 'onActiveAssociation',
                finish: 'finishWizard',
                cancel: 'finishWizard'
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

    finishWizard: function () {
        var me = this;
        me.getView().fireEvent('finish', me);

    },

    onActiveColumns: function () {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            view = me.getView(),
            columns = view.down('targets-columns');

        columns.setCurrentCatalog(currentCatalog);

    },

    onActiveAssociation: function () {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            view = me.getView(),
            association = view.down('targets-association');

        association.setCatalog(currentCatalog);

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
