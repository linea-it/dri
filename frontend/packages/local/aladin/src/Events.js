Ext.define('aladin.Events', {

    mouseIsDown: false,

    mouseInitialPosition: [],

    mouseLastPosition: [],

    addCustomEvents: function () {
        var me = this;

        me.addDblClickListener();

        me.addMouseDown();

        me.addMouseMoveListener();

        me.addMouseUP();

    },

    // addClickListener: function () {
    //     var me = this,
    //         aladin = me.getAladin(),
    //         view = aladin.view,
    //         reticleCanvas = aladin.view.reticleCanvas,
    //         radec, xymouse;

    //     reticleCanvas.addEventListener('click', function (e) {
    //         xymouse = view.imageCanvas.relMouseCoords(e);

    //         radec = me.mousePositionToSky(xymouse);

    //         if (radec) {
    //             me.fireEvent('onclick', radec, me);

    //         }
    //     });
    // },

    addDblClickListener: function () {
        var me = this,
            aladin = me.getAladin(),
            view = aladin.view,
            reticleCanvas = aladin.view.reticleCanvas,
            radec, xymouse, handler;

        handler = function (e) {
            xymouse = view.imageCanvas.relMouseCoords(e);

            radec = me.mousePositionToSky(xymouse);

            if (radec) {

                // atualizar a coordenada atual
                me.updateLocation(radec);

                if (!me.preventDbClickFire) {
                    me.preventDbClickFire = true;

                    task = me.runner.newTask({
                        run: function () {
                            me.preventDbClickFire = false;
                        },
                        interval: 20,
                        repeat: 1
                    });
                    task.start();

                    me.fireEvent('ondblclick', radec, me);
                }
            }
        }
        // Remove o evento primeiro para evitar duplicar. 
        reticleCanvas.removeEventListener('dblclick', handler);

        reticleCanvas.addEventListener('dblclick', handler);
    },

    addMouseDown: function () {
        var me = this,
            aladin = me.getAladin(),
            view = aladin.view,
            reticleCanvas = view.reticleCanvas,
            radec, xymouse, handler;

        handler = function (e) {
            xymouse = view.imageCanvas.relMouseCoords(e);

            radec = me.mousePositionToSky(xymouse);

            if (radec) {
                me.mouseIsDown = true;
                me.mouseInitialPosition = radec;
                me.mouseLastPosition = radec;
            }
        }
        // Remove o evento primeiro para evitar duplicar. 
        reticleCanvas.removeEventListener('mousedown', handler);

        reticleCanvas.addEventListener('mousedown', handler);
    },

    addMouseMoveListener: function () {
        var me = this,
            aladin = me.getAladin(),
            view = aladin.view,
            reticleCanvas = view.reticleCanvas,
            radec, xymouse, handler;

        handler = function (e) {
            xymouse = view.imageCanvas.relMouseCoords(e);

            radec = me.mousePositionToSky(xymouse);

            if (radec) {
                // Atualizar a string com a posicao do reticle
                me.updateLocation(me.getRaDec(), radec);

                // Se o mouse estiver pressionado passa a ser uma acao de pan.
                if (me.mouseIsDown) {

                    // Guardar a posicao do mouse atual.
                    me.mouseLastPosition = radec;

                    // Atualizar a string com a posicao do reticle
                    //me.updateLocation(me.getRaDec());

                    // Evento reticlemove deve retornar a coordeana atual do reticle no movimento do mouse.
                    me.fireEvent('reticlemove', me.getRaDec(), me);
                }

            }
        }

        // Remove o evento primeiro para evitar duplicar. 
        reticleCanvas.removeEventListener('mousemove', handler);

        reticleCanvas.addEventListener('mousemove', handler);
    },

    addMouseUP: function () {
        var me = this,
            aladin = me.getAladin(),
            view = aladin.view,
            reticleCanvas = view.reticleCanvas,
            radec, xymouse, handler, pickerMode, pickerEventName;

        handler = function (e) {
            xymouse = view.imageCanvas.relMouseCoords(e);

            radec = me.mousePositionToSky(xymouse);

            if (radec) {
                if (me.mouseIsDown) {
                    if (!Ext.Array.equals(me.mouseInitialPosition, me.mouseLastPosition)) {
                        // Usar a coordenada da reticle para o evento pan
                        me.fireEvent('onpanend', me.getRaDec(), me);

                    } else {
                        pickerMode = me.getPickerMode();
                        pickerEventName = me.getPickerEventName();
                        // Antes de disparar o evento de click verificar se a pickerMode está ativo
                        // Se estiver o evento de click dispara o evento de picker. 
                        // Se não estiver será um evento de Click normal.
                        console.log(me.getPickerMode())
                        if (me.getPickerMode()) {
                            console.log("Aladin: OnPicker")
                            console.log("Disparou um evento picker: %o", pickerEventName)
                            // Garante que vai ter um evento para picker.
                            if (!me.getPickerEventName()) {
                                me.fireEvent('onpicker', me.mouseLastPosition, me);
                            } else {
                                me.fireEvent(me.getPickerEventName(), me.mouseLastPosition, me);
                            }


                        } else {
                            console.log("Aladin: OnClick")
                            me.fireEvent('onclick', me.mouseLastPosition, me);
                        }
                    }
                }

                // reseta os status do mouse.
                me.mouseIsDown = false;
                me.mouseInitialPosition = [];
                me.mouseLastPosition = [];
            }
            e.stopPropagation()
        }
        // Remove o evento primeiro para evitar duplicar. 
        reticleCanvas.removeEventListener('mouseup', handler);

        // Adiciona o Evento
        reticleCanvas.addEventListener('mouseup', handler);
    },

    mousePositionToSky: function (xymouse) {
        var me = this,
            aladin = me.getAladin(),
            view = aladin.view,
            xy, lonlat,
            radec = [];

        xy = AladinUtils.viewToXy(xymouse.x, xymouse.y, view.width,
            view.height, view.largestDim, view.zoomFactor);

        try {
            lonlat = view.projection.unproject(xy.x, xy.y);
        }
        catch (err) {
            return;
        }

        // convert to J2000 if needed
        if (view.cooFrame == CooFrameEnum.GAL) {
            radec = CooConversion.GalacticToJ2000([lonlat.ra, lonlat.dec]);

        } else {
            radec = [parseFloat(lonlat.ra.toFixed(5)), parseFloat(lonlat.dec.toFixed(5))];

        }

        return radec;
    },

    //converte radec para o formato string "ra, dec"
    skyToString: function (radec) {

        if ((radec) && (radec[0]) && (radec[1])) {
            return String(radec[0].toFixed(5) + ', ' + radec[1].toFixed(5));
        }
    },

    updateLocation: function (radec, mradec) {
        var me = this,
            location, mlocation;

        location = me.skyToString(radec);
        mlocation = me.skyToString(mradec);

        me.setLocation(location, mlocation);
    },

    onClickBtnMap: function () {
        //console.log('onClickBtnMap');

        var me = this,
            vm = me.getViewModel(),
            release = vm.get('release');


        if (me.windowMapSelection == null) {
            me.windowMapSelection = Ext.create('aladin.maps.MapSelectionWindow', {
                width: 182,
                height: 500,
                x: 45,
                y: 55,
                resizable: false,
                aladin: me
            });
        }

        me.windowMapSelection.setRelease(release);

        if (me.windowMapSelection.isHidden()) {
            me.windowMapSelection.show();
        } else {
            me.windowMapSelection.hide();
        }

    }

});
