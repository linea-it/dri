/**
 * Based On
 * https://docs.sencha.com/extjs/6.2.0/modern/src/Svg.js.html
 * https://docs.sencha.com/extjs/6.2.0/modern/src/Component.js-2.html
 */
Ext.define('Explorer.view.main.D3Component', {
    extend: 'Ext.Component',

    title: 'D3 Js',

    config: {

        baseCls: Ext.baseCSSPrefix + 'd3',

        padding: {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        },

        store: null
    },

    d3: null,

    resizeDelay: 250, // in milliseconds

    resizeTimerId: 0,

    size: null, // cached size

    defs: null,

    wrapper: null,
    wrapperClipRect: null,
    wrapperClipId: 'wrapper-clip',

    svg: null,

    defaultCls: {
        wrapper: Ext.baseCSSPrefix + 'd3-wrapper',
        scene: Ext.baseCSSPrefix + 'd3-scene',
        hidden: Ext.baseCSSPrefix + 'd3-hidden'
    },

    /**
     * @private
     * See {@link #getScene}.
     */
    scene: null,
    sceneRect: null, // object with scene's position and dimensions: x, y, width, height

    height: '100%',

    initComponent: function () {
        console.log("initComponent()")
        var me = this;

        me.callParent(arguments);

        if (window.d3) {
            me.d3 = window.d3;
            console.log("D3 version: %o", me.d3.version);


            me.on('resize', 'onElementResize', me);

        } else {
            console.log('window.d3 ainda nao esta carregada, incluir no app.json a biblioteca D3JS');
        }
    },

    onElementResize: function (element, size) {
        this.handleResize(this.getSize());
    },

    handleResize: function (size, instantly) {
        console.log("handleResize(%o)", size)
        var me = this,
            el = me.getEl();

        if (!(el && (size = size || el.getSize()) && size.width && size.height)) {
            return;
        }

        clearTimeout(me.resizeTimerId);

        if (instantly) {
            me.resizeTimerId = 0;
        } else {
            me.resizeTimerId = Ext.defer(me.handleResize, me.resizeDelay, me, [size, true]);
            return;
        }

        me.resizeHandler(size);

        // if (me.panZoom && me.panZoom.updateIndicator) {
        //     me.panZoom.updateIndicator();
        // }

        me.size = size;
    },

    resizeHandler: function (size) {
        console.log("resizeHandler(%o)", size)
        var me = this,
            svg = me.getSvg(),
            paddingCfg = me.getPadding(),
            isRtl = me.getInherited().rtl,
            wrapper = me.getWrapper(),
            wrapperClipRect = me.getWrapperClipRect(),
            scene = me.getScene(),
            width = size && size.width,
            height = size && size.height,
            rect;

        if (!(width && height)) {
            return;
        }

        svg
            .attr('width', width)
            .attr('height', height);

        rect = me.sceneRect || (me.sceneRect = {});

        rect.x = isRtl ? paddingCfg.right : paddingCfg.left;
        rect.y = paddingCfg.top;
        rect.width = width - paddingCfg.left - paddingCfg.right;
        rect.height = height - paddingCfg.top - paddingCfg.bottom;



        wrapper
            .attr('transform', 'translate(' + rect.x + ',' + rect.y + ')');

        wrapperClipRect
            .attr('width', rect.width)
            .attr('height', rect.height);

        me.onSceneResize(scene, rect);
        me.fireEvent('sceneresize', me, scene, rect);
    },

    getSvg: function () {
        var me = this,
            el = me.getEl();


        // Spec: https://www.w3.org/TR/SVG/struct.html
        // Note: foreignObject is not supported in IE11 and below (can't use HTML elements inside SVG).
        return me.svg || (me.svg = me.d3.select(el.dom).append('svg').attr('version', '1.1'));
    },

    getWrapper: function () {
        var me = this,
            padding = me.wrapper;

        if (!padding) {
            padding = me.wrapper = me.getSvg().append('g').classed(me.defaultCls.wrapper, true);
        }

        return padding;
    },

    getWrapperClipRect: function () {
        var me = this,
            rect = me.wrapperClipRect;

        if (!rect) {
            rect = me.wrapperClipRect = me.getDefs()
                .append('clipPath').attr('id', me.wrapperClipId)
                .append('rect').attr('fill', 'white');
        }

        return rect;
    },

    /**
     * SVG ['defs'](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs) element
     * as a D3 selection.
     * @return {d3.selection}
     */
    getDefs: function () {
        var defs = this.defs;

        if (!defs) {
            defs = this.defs = this.getSvg().append('defs');
        }

        return defs;
    },

    /**
     * Get the scene element as a D3 selection.
     * If the scene doesn't exist, it will be created.
     * @return {d3.selection}
     */
    getScene: function () {
        var me = this,
            padding = me.getWrapper(),
            scene = me.scene;

        if (!scene) {
            me.scene = scene = padding.append('g').classed(me.defaultCls.scene, true);

            me.setupScene(scene);
            me.fireEvent('scenesetup', me, scene);
        }

        return scene;
    },

    /**
      * @protected
      * Called once when the scene (main group) is created.
      * @param {d3.selection} scene The scene as a D3 selection.
      */
    setupScene: Ext.emptyFn,


    destroy: function () {
        console.log("destroy()");
        this.getSvg().remove();
        this.callParent();
    },

    /**
     * @private
     */
    clearScene: function () {
        var me = this,
            scene = me.scene,
            defs = me.defs;

        if (scene) {
            scene = scene.node();
            scene.removeAttribute('transform');
            while (scene.firstChild) {
                scene.removeChild(scene.firstChild);
            }
        }

        if (defs) {
            defs = defs.node();
            while (defs.firstChild) {
                defs.removeChild(defs.firstChild);
            }
        }
    },

    /**
     * @protected
     * This method is called after the scene gets its position and size.
     * It's a good place to recalculate layout(s) and re-render the scene.
     * @param {d3.selection} scene
     * @param {Object} rect
     * @param {Number} rect.x
     * @param {Number} rect.y
     * @param {Number} rect.width
     * @param {Number} rect.height
     */
    onSceneResize: Ext.emptyFn,


    showScene: function () {
        this.scene && this.scene.classed(this.defaultCls.hidden, false);
    },

    hideScene: function () {
        this.scene && this.scene.classed(this.defaultCls.hidden, true);
    },

    applyPadding: function (padding, oldPadding) {
        var result;

        if (!Ext.isObject(padding)) {
            result =  Ext.util.Format.parseBox(padding);
        } else if (!oldPadding) {
            result = padding;
        } else {
            result = Ext.apply(oldPadding, padding);
        }

        return result;
    },

    setStore: function (store) {

        this.store = store;
    }


});
