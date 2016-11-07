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
                next: 'showNext',
                finish: 'finishWizard'
            },
            'targets-association': {
                activate: 'onActiveAssociation',
                previous: 'showPrevious',
                next: 'showNext',
                finish: 'finishWizard'
            },
            'targets-columns': {
                activate: 'onActiveColumns',
                previous: 'showPrevious',
                //next: 'showNext'
                finish: 'finishWizard'
            }
        }
    },

    showNext: function () {
        this.doCardNavigation(1);
    },

    showPrevious: function () {
        this.doCardNavigation(-1);
    },

    doCardNavigation: function (incr) {
        var me = this,
            view = me.getView(),
            l = view.getLayout(),
            i = l.activeItem.id.split('card-')[1],
            next = parseInt(i, 10) + incr;

        l.setActiveItem(next);

    },

    onSelectSetting: function (setting) {
        var me = this,
            vm = me.getViewModel(),
            view = me.getView(),
            l = view.getLayout(),
            association = view.down('targets-association'),
            oldCurrentSetting = vm.get('currentSetting');

        vm.set('currentSetting', setting);

        view.setCurrentSetting(setting);
    },

    finishWizard: function () {
        var me = this;
        me.getView().fireEvent('finish', me);

    },

    onActiveAssociation: function () {
        var me = this,
            vm = me.getViewModel(),
            currentSetting = vm.get('currentSetting'),
            view = me.getView(),
            association = view.down('targets-association');

        association.setCurrentSetting(currentSetting);

    },

    onActiveColumns: function () {
        var me = this,
            vm = me.getViewModel(),
            currentSetting = vm.get('currentSetting'),
            view = me.getView(),
            columns = view.down('targets-columns');

        columns.setCurrentSetting(currentSetting);

    }

});
