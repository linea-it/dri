/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Target.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',

    requires: [
        //'Target.view.objects.Panel'
    ],

    routes : {
        'home': {
            action: 'onHome'
        },
        'cv/:catalog' : {
            action: 'onCatalogViewByCatalogId'
        }
    },

    setActivePanel: function (panel) {

        var me = this,
            refs = me.getReferences(),
            mainCard = refs.mainCardPanel,
            mainLayout = mainCard.getLayout(),
            routeId = panel.routeId,
            existingItem = mainCard.child('component[routeId=' + routeId + ']'),
            view = null;

        // Saber se ja existe uma interface  criada.
        if (!existingItem) {

            view = mainCard.add(panel);

            view.loadPanel(arguments);

            mainLayout.setActiveItem(view);

        } else {

            view = existingItem;

            view.updatePanel(arguments);

            mainLayout.setActiveItem(view);

        }
    },

    onHome: function () {

        var newView = Ext.create('Target.view.home.Home', {
            hideMode: 'offsets',
            routeId: 'home',
            layout: 'fit'
        });

        this.setActivePanel(newView);
    },

    onCatalogViewByCatalogId: function (catalog) {
        // console.log('onCatalogViewByRelease(%o)', catalog);

        var newView = Ext.create('Targets.view.objects.Panel', {
            hideMode: 'offsets',
            routeId: 'cv'
        });

        this.setActivePanel(newView, catalog);
    }
});
