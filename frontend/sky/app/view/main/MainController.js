/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Sky.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',

    requires: [
        'Sky.view.home.Home',
        'Sky.view.footprint.Footprint',
        'Sky.view.dataset.Dataset'
    ],

    routes : {
        'home': {
            action: 'onHome'
        },
        'sky/:release': {
            action: 'onSky'
        },
        'sky/:release/:coordinate/:fov': {
            action: 'onSky'
        },
        'sky/:release/:coordinate': {
            action: 'onSky'
        },
        'dataset/:dataset/:coordinate/:fov': {
            action: 'onDataset'
        },
        'dataset/:dataset/:coordinate': {
            action: 'onDataset'
        }
    },

    doSearch: function(value){
        var view = this.getView(),
            footprintAladin = view.down('footprint'),
            footprintAladinCtrl = footprintAladin.getController();

        footprintAladinCtrl.toVisiomatic(value);
        //console.log(value, aladin);
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
        var newView = Ext.create('Sky.view.home.Home', {
            hideMode: 'offsets',
            routeId: 'home',
            layout: 'fit'
        });

        this.setActivePanel(newView);
    },

    onSky: function (release, coordinate, fov) {
        var newView = Ext.create('Sky.view.footprint.Footprint', {
            hideMode: 'offsets',
            routeId: 'sky',
            layout: 'fit',
            release: release,
            coordinate: coordinate,
            foc: fov
        });

        this.setActivePanel(newView, release, coordinate, fov);
    },

    onDataset: function (dataset, coordinate, fov) {
        var newView = Ext.create('Sky.view.dataset.Dataset', {
            hideMode: 'offsets',
            routeId: 'tile',
            layout: 'fit',
            dataset: dataset,
            coordinate: coordinate,
            fov: fov
        });

        this.setActivePanel(newView, dataset, coordinate, fov);

    }

});
