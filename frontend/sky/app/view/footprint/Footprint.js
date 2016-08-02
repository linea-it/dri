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
                    bind: {
                        storeSurveys: '{surveys}',
                        storeTags: '{tags}',
                        storeTiles: '{tiles}'
                    },
                    listeners: {
                        ondblclick: 'onDblClickFootprint'
                    }
                }
            ]
        });

        me.callParent(arguments);
    },

    loadPanel: function () {
        this.fireEvent('loadpanel', this);

    },

    setRelease: function (release) {
        var me = this,
            vm = me.getViewModel();

        if (release > 0) {
            me.release = release;

            vm.set('release', release);

            me.fireEvent('changerelease', release, me);
        }
    }

});
