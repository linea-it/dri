/**
 *
 */
Ext.define('Target.view.wizard.WizardController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.wizard',

    // requires: [
    //     'Target.view.catalog.Export',
    //     'Target.view.catalog.SubmitCutout',
    //     'Target.view.association.Panel',
    //     'Target.model.Rating',
    //     'Target.model.Reject'
    // ],

    listen: {
        component: {
            'targets-settings': {
                selectsetting: 'onSelectSetting',
                finish: 'finishWizard'
            },
            'targets-association': {
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
        //     store: {
        //         '#ProductContent': {
        //             load: 'onLoadProductContent',
        //             clear: 'onLoadProductContent'
        //         },
        //         '#ProductAssociation': {
        //             load: 'onLoadProductAssociation',
        //             clear: 'onLoadProductAssociation'
        //         },
        //         '#objects': {
        //             update: 'onUpdateObject'
        //         }
        //     }
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

        // view.down('#card-prev').setDisabled(next === 0);
        // view.down('#card-next').setDisabled(next === 2);
    },

    onSelectSetting: function (setting) {
        var me = this,
            vm = me.getViewModel(),
            view = me.getView(),
            l = view.getLayout(),
            association = view.down('targets-association');

        vm.set('currentSetting', setting);

        view.enableTabs();

        // Setting selecionado
        association.setSetting(setting.get('cst_setting'));

        // Product
        association.setProduct(setting.get('cst_product'));

        // Ativar o painel
        l.setActiveItem(association);

    },

    finishWizard: function () {
        var me = this;
        me.getView().fireEvent('finish', me);

    },

    onActiveColumns: function () {
        console.log('onActiveColumns');

        var me = this,
            vm = me.getViewModel(),
            currentSetting = vm.get('currentSetting'),
            view = me.getView(),
            columns = view.down('targets-columns');

        columns.setCurrentSetting(currentSetting);

    }

});
