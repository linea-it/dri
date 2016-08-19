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

    // listen: {
    //     component: {
    //         'targets-objects-panel': {
    //             beforeLoadPanel: 'onBeforeLoadPanel',
    //             beforeloadcatalog: 'onBeforeLoadCatalog'
    //         },
    //         'targets-objects-tabpanel': {
    //             select: 'onSelectObject'
    //         }
    //     },
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
    // },

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

        view.down('#card-prev').setDisabled(next === 0);
        view.down('#card-next').setDisabled(next === 2);
    }

});
