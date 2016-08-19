/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Eyeballing.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',

    requires: [
        'Eyeballing.view.home.Home',
        'Eyeballing.view.eyeballing.Eyeballing'
    ],

    routes : {
        'home': {
            action: 'onHome'
        },
        'ebl/:release': {
            action: 'onEyeballing'
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
        var newView = Ext.create('Eyeballing.view.home.Home', {
            hideMode: 'offsets',
            routeId: 'home',
            layout: 'fit'
        });

        this.setActivePanel(newView);
    },

    onEyeballing: function (release) {
        var newView = Ext.create('Eyeballing.view.eyeballing.Eyeballing', {
            hideMode: 'offsets',
            routeId: 'eyeballing',
            layout: 'fit',
            release: release
        });

        this.setActivePanel(newView, release);
    }
});
