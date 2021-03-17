/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Explorer.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',

    requires: [
        'Explorer.view.coadd.Coadd',
        'Explorer.view.system.System',
        'Explorer.view.star_cluster.StarCluster'
    ],

    routes: {
        'coadd/:source/:object': {
            action: 'onCoadd'
        },
        'system/:source/:object': {
            action: 'onSystem'
        },
        'star_cluster/:source/:object': {
            action: 'onStarCluster'
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

    onCoadd: function (source, object_id) {

        var newView = Ext.create('Explorer.view.coadd.Coadd', {
            hideMode: 'offsets',
            routeId: 'coadd',
            layout: 'fit'
        });

        this.setActivePanel(newView, source, object_id);
    },

    onSystem: function (source, object_id) {
        var newView = Ext.create('Explorer.view.system.System', {
            hideMode: 'offsets',
            routeId: 'system',
            layout: 'fit'
        });

        this.setActivePanel(newView, source, object_id);

    },

    onStarCluster: function (source, object_id) {
        var newView = Ext.create('Explorer.view.star_cluster.StarCluster', {
            hideMode: 'offsets',
            routeId: 'starcluster',
            layout: 'fit'
        });

        this.setActivePanel(newView, source, object_id);

    }
});
