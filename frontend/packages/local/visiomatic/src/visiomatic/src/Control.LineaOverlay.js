/**
 * This control is just a button that triggers the overlaycatalog event that will be used with the
 * LIneA - DRI integration
 */
L.Control.LineaOverlay = L.Control.extend({
    options: {
        position: 'topleft',
        title: 'Catalog Overlay',
        forceSeparateButton: false
    },

    onAdd: function (map) {
        var className = 'leaflet-control-linea-overlay-catalog', container;

        if (map.zoomControl && !this.options.forceSeparateButton) {
            container = map.zoomControl._container;
        } else {
            container = L.DomUtil.create('div', 'leaflet-bar');
        }

        this._createButton(this.options.title, className, container, this.onClickLineaOverlayCatalog, map);

        return container;
    },

    _createButton: function (title, className, container, fn, context) {
        var link = L.DomUtil.create('a', className, container);
        link.href = '#';
        link.title = title;

        L.DomEvent
            .addListener(link, 'click', L.DomEvent.stopPropagation)
            .addListener(link, 'click', L.DomEvent.preventDefault)
            .addListener(link, 'click', fn, context);


        return link;
    },

    onClickLineaOverlayCatalog: function () {

        this.fire('overlaycatalog');

    },

});

L.Map.addInitHook(function () {
    if (this.options.enableLineaOverlay) {

        console.log('entrou aqui')
        this.lineaoverlayControl = L.control.lineaoverlay();
        this.addControl(this.lineaoverlayControl);
    }
});

L.control.lineaoverlay = function (options) {
    return new L.Control.LineaOverlay(options);
};
