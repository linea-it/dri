Ext.define('Sky.view.footprint.Footprint', {
    extend: 'Ext.panel.Panel',

    xtype: 'footprint',

    requires: [
        'Sky.view.footprint.FootprintController',
        'Sky.view.footprint.FootprintModel',
        'Sky.view.footprint.Aladin'
    ],

    controller: 'footprint',

    viewModel: 'footprint',

    config: {
        release: null
    },

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            items: [
                {
                    xtype: 'footprint-aladin',
                    reference: 'aladin',
                    tilesGridVisible: true,
                    bind: {
                        storeSurveys: '{surveys}',
                        storeTags: '{tags}',
                        storeTiles: '{tiles}'
                    },
                    listeners: {
                        ondblclick: 'onDblClickAladin'
                    }
                }
            ]
        });

        me.callParent(arguments);
    },

    loadPanel: function (arguments) {
        var me = this,
            release = me.getRelease(),
            vm = this.getViewModel();

        if (release > 0) {

            vm.set('release', release);

            this.fireEvent('loadpanel', release, this);
        }
    },

    updatePanel: function (arguments) {
        var me = this,
            oldrelease = me.getRelease(),
            release = arguments[1],
            vm = this.getViewModel();

        if ((release > 0) && (release != oldrelease)) {
            me.setRelease(release);

            vm.set('release', release);

            this.fireEvent('updatePanel', release, this);
        }
    }
});
