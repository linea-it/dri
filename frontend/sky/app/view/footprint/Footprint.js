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
        release: null,
        coordinate: null,
        fov: null,
        radec: null,
        defaultMinFov: 180,
    },

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            items: [
                {
                    xtype: 'footprint-aladin',
                    reference: 'aladin',
                    bind: {
                        storeSurveys: '{surveys}',
                        storeTags: '{tags}',
                        storeTiles: '{tiles}'
                    },
                    listeners: {
                        ondblclick: 'onDblClickAladin',
                        gotoposition: 'onAladinGoToPosition'
                    },
                    auxTools: [
                        {
                            xtype: 'button',
                            iconCls: 'x-fa fa-link',
                            tooltip: 'Get Link',
                            handler: 'getLink'
                        },
                        {
                            xtype: 'button',
                            iconCls: 'x-fa fa-arrow-right ',
                            tooltip: 'Go to Image Viewer',
                            handler: 'onClickGoToImage'
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    },

    loadPanel: function (arguments) {
        var me = this,
            release = me.getRelease(),
            coordinate = arguments[2],
            fov = arguments[3],
            vm = this.getViewModel();

        if (release > 0) {

            vm.set('release', release);

            this.fireEvent('loadpanel', release, this);
        }

        me.setParameters(coordinate, fov);
    },

    updatePanel: function (arguments) {
        var me = this,
            oldrelease = me.getRelease(),
            release = arguments[1],
            coordinate = arguments[2],
            fov = arguments[3],
            vm = this.getViewModel();

        if ((release > 0) && (release != oldrelease)) {
            me.setRelease(release);

            vm.set('release', release);

            this.fireEvent('updatePanel', release, this);
        } else {
            me.setParameters(coordinate, fov);
        }
    },

    setParameters: function (coordinate, fov) {
        var me = this,
            aladin = me.lookup('aladin'),
            coordinates, radec;

        coordinate = decodeURIComponent(coordinate);

        if (coordinate) {
            if (coordinate.includes('+')) {
                coordinates = coordinate.split('+');

            } else {
                coordinates = coordinate.split('-');
                coordinates[1] = '-' + coordinates[1];
            }

            radec = {
                ra: parseFloat(coordinates[0].replace(',', '.')),
                dec: parseFloat(coordinates[1].replace(',', '.'))
            };

            me.setRadec(radec);

            strcoordinate = radec.ra + ', ' + radec.dec;
            me.setCoordinate(strcoordinate);

            if (aladin.aladinIsReady()) {
                // Setar a posicao
                aladin.goToPosition(strcoordinate);
            }

        }
        // Se o parametro fov for == -1 centraliza a tile
        if (fov) {
            if (fov == -1) {
                me.setFov(me.getDefaultFov());

            } else {

                fov = parseFloat(fov.replace(',', '.'));
                if (fov > me.getDefaultMinFov()) {
                    fov = me.getDefaultMinFov();
                }
                me.setFov(fov);
            }

            if (aladin.aladinIsReady()) {
                // Setar o zoom
                aladin.setFov(fov);
            }

        }
    },

});
