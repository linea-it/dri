Ext.define('Explorer.view.system.Cmd', {
    extend: 'Explorer.view.system.D3SvgComponent',

    requires: [
        'Explorer.view.system.D3SvgComponent',
    ],

    xtype: 'system-cmd',

    // plotTitle: 'CMD',
    // xAxisTitle: 'r',
    // yAxisTitle: 'g-r',

    config: {

        dataSeries: {
            gr: {
                id: 'g-r',
                title: '(g-r) vs. r',
                xAxisTitle: 'r',
                yAxisTitle: 'g-r',
                values: []
            },
            ri: {
                id: 'r-i',
                title: '(r-i) vs. i',
                xAxisTitle: 'i',
                yAxisTitle: 'r-i',
                values: []
            },
            iz: {
                id: 'i-z',
                title: '(i-z) vs. z',
                xAxisTitle: 'z',
                yAxisTitle: 'i-z',
                values: []
            },
            zy: {
                id: 'z-y',
                title: '(z-y) vs. Y',
                xAxisTitle: 'Y',
                yAxisTitle: 'z-Y',
                values: []
            },
        },
        plotData: [],

        svgMargin: {
            top: 50,
            left:50,
            right: 100,
            bottom:50
        },

        legend: {
            width: 0,
            height: 0,
            y: 20,
            // Tamanho do quadrado ou circulo com a cor da serie
            iconSize: 20,
            // Distancia entre cada serie e distancia
            iconPadding: 5
        },

        colorScale: null
    },

    idleTimeout: null,
    idleDelay: 350,

    proportionalSize: false,

    performLayout: function (scene, rect) {
        // console.log('performLayout(%o, %o)', scene, rect);

        var me = this,
            width = rect.width,
            height = rect.height,
            dataSeries = me.getDataSeries(),
            data = me.loadData(me.getStore(), dataSeries),
            axisPadding = 0.2;

        var color = d3.scaleOrdinal(d3['schemeCategory10'])
        me.setColorScale(color);

        // Axis Domain with multiple series Ex:
        // https://gist.github.com/mbostock/3884955#file-index-html-L52
        me.x = d3.scaleLinear()
            .range([0, width])
            .domain([
                d3.min(data, function(s){return d3.min(s.values, function (d) {
                    return d.x - axisPadding;})}),
                d3.max(data, function(s){return d3.max(s.values, function (d) {
                    return d.x + axisPadding;})}),
            ])

        me.xAxis = d3.axisBottom(me.x)

        me.y = d3.scaleLinear()
            .range([height, 0])
            .domain([
                d3.min(data, function(s){return d3.min(s.values, function (d) {
                    return d.y - axisPadding;})}),
                d3.max(data, function(s){return d3.max(s.values, function (d) {
                    return d.y + axisPadding;})}),
            ])

        me.yAxis = d3.axisLeft(me.y)

        // Quadrado de selecao para o zoom
        // https://bl.ocks.org/EfratVil/d956f19f2e56a05c31fb6583beccfda7
        me.brush = d3.brush()
            .extent([[0, 0], [width, height]])
            .on("end", function () {
                me.onBrushendend()
            });

        // X Axis Group
        me.gx = scene.append("g")
           .attr("class", "axis axis--x")
           .attr('id', "axis--x")
           .attr("transform", "translate(0," + height + ")")
           .call(me.xAxis);

        // Y Axis Group
        me.gy =scene.append("g")
           .attr("class", "axis axis--y")
           .attr('id', "axis--y")
           .call(me.yAxis);

        me.scene.append("g")
           .attr("class", "brush")
           .call(me.brush);

        me.scatter = scene.append("g")
             .attr("id", "scatterplot")

        me.scatter.selectAll(".series")
            .data(data)
            .enter().append("g")
                .attr("class", "series")
                // Atribuo um ID para a serie
                .attr('id', function(d){ return "serie-" + d.id; })
                .attr("active", false)
                .style("fill", function(d, i) {return color(i);})
                // Todos ocultos
                .style("opacity", 1)
                .style("display", "none")
            .selectAll(".dot")
                .data(function (d) {
                    return d.values;
                })
            .enter().append("circle")
                .attr("class", "dot")
                .attr("r", 3.5)
                .attr("cx", function(d) {
                    return me.x(d.x); })
                .attr("cy", function(d) { return me.y(d.y); })
                .on("mouseover", function (d) {me.onMouseOverPoint(d, this);})
                .on("mouseout", function (d) {me.onMouseOutPoint(d, this);})
                .on("click", function (d) {me.onClickPoint(d, this);})


        // Adiciona as Labels nos Axis
        me.createAxisTitles();

        // Adiciona o Titulo do Plot
        me.createPlotTitle()

        // Adiciona o Box da Legenda
        me.createLegendBox(scene, rect, data)

        // Activa a primeira serie, todas as series iniciam desativadas
        me.deactiveAllSeries();
        me.activeSerie(data[0]);
    },


    loadData: function (store, dataSeries) {
        // console.log('loadData(%o)', store)
        var me = this,
            data = [];

        store.each(function (record) {
            // console.log(record)
            var mag_g = parseFloat(record.get('mag_g')),
                mag_r = parseFloat(record.get('mag_r')),
                mag_i = parseFloat(record.get('mag_i')),
                mag_z = parseFloat(record.get('mag_r')),
                mag_y = parseFloat(record.get('mag_y'));

            // g-r Serie
            dataSeries.gr.values.push({
                "id": record.get('_meta_id'),
                "x": mag_r,
                "y": mag_g - mag_r,
                "serie": "g-r"
            })

            // r-i Serie
            dataSeries.ri.values.push({
                "id": record.get('_meta_id'),
                "x": mag_i,
                "y": mag_r - mag_i,
                "serie": "r-i"
            })

            // i-z Serie
            dataSeries.iz.values.push({
                "id": record.get('_meta_id'),
                "x": mag_z,
                "y": mag_i - mag_z,
                "serie": "i-z"
            })

            // z-y Serie
            dataSeries.zy.values.push({
                "id": record.get('_meta_id'),
                "x": mag_y,
                "y": mag_z - mag_y,
                "serie": "z-y"
            })
        })

        data.push(dataSeries.gr);
        data.push(dataSeries.ri);
        data.push(dataSeries.iz);
        data.push(dataSeries.zy);


        me.setPlotData(data);
        return data;
    },

    createLegendBox: function (scene, rect, data) {
        // console.log('createLegendBox()')
        var me = this,
            config = me.getLegend(),
            colorScale = me.getColorScale();

        // Adiciona Legenda
        // adding legend
        var legend = scene.selectAll(".legend")
            .data(data)
            .enter().append("g")
            .attr("class", "legend")
            .attr("id", function (d) { return "legendItem-" + d.id; })
            .attr("transform", function(d, i) {
                var size = config.iconSize + config.iconPadding
                // Comeca do final do rect e ao y a cada item da legenda
                // acrescenta o tamanho do icone
                return "translate("+ rect.width + "," + i * size + ")";
            })
            .on('click', function (d) {
                me.changeSerie(d)
            })
            .each(function (d, i) {
                g = d3.select(this);

                g.append("rect")
                    .attr("width", config.iconSize)
                    .attr("height", config.iconSize)
                    .style("fill", colorScale(i))

                g.append("text")
                    .attr("x", config.iconSize + 5)
                    .attr("y", 10)
                    .attr("dy", ".35em")
                    .text(d.title)
            })

    },

    showHideSerie: function (serie, isVisible) {
        // console.log("showHideSerie(%o)", serie);
        var legendItem =  d3.select("#legendItem-" + serie.id),
            gSerie = d3.select("#serie-" + serie.id);

        if (isVisible) {
            // Tornar Visivel
            gSerie
                .attr("active", true)
                .transition()
        		.duration(1000)
                .style("opacity", 1)
                .style("display", "block")

            legendItem
                .transition()
                .duration(1000)
                .style ("opacity", 1);


        } else {
            // Tornar Oculta
            gSerie
                .attr("active", false)
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .style("display", "none");

            legendItem
                .transition()
                .duration(1000)
                .style ("opacity", .3);
        }
    },

    changeSerie: function (serie) {
        var me = this,
            gSerie = d3.select("#serie-" + serie.id),
            active = gSerie.attr("active") === 'true' ? true : false;

        // Se ja estiver ativa significa que clicou na mesma serie apenas
        // desativa ela, a ideia e ter sempre so uma serie ativa
        if (active) {
            me.deactiveSerie(serie);

        } else {
            me.deactiveAllSeries();
            me.activeSerie(serie)

        }

    },

    activeSerie: function (serie) {
        // console.log("activeSerie(%o)", serie);
        var me = this;

        me.showHideSerie(serie, true);

        me.setPlotTitle(serie.title);

        me.setXAxisTitle(serie.xAxisTitle);

        me.setYAxisTitle(serie.yAxisTitle);
    },

    deactiveAllSeries: function () {
        // console.log("deactiveAllSeries()");
        var me = this,
            plotData = me.getPlotData();

        Ext.each(plotData, function (d) {
            me.deactiveSerie(d);
        })
    },

    deactiveSerie: function (serie) {
        // console.log("deactiveSerie(%o)", serie);
        var me = this;

        me.showHideSerie(serie, false);
    },

    onMouseOverPoint: function (data, point) {
        var me = this,
            elPoint = d3.select(point),
            gSerie = d3.select("#serie-" + data.serie);

        // coloca todos os outros pontos transparentes
        gSerie
            .transition()
            .duration(300)
            .attr('fill-opacity', 0.2)

        // Destaca o Objeto em Foco
        elPoint
            .attr("r", 6)
            .attr('fill-opacity', 1)
            .style("cursor", "pointer")

    },

    onMouseOutPoint: function (data, point) {
        var me = this,
            elPoint = d3.select(point),
            gSerie = d3.select("#serie-" + data.serie);

        // coloca todos os pontos ao estado normal
        gSerie
            .transition()
            .duration(300)
            .attr('fill-opacity', null)

        elPoint
            .attr("r", 3.5)
            .attr('fill-opacity', null)
            .style("cursor", "default")


    },

    onClickPoint: function (data, point) {
        var me = this,
            store = me.getStore(),
            record;

        record = store.findRecord("_meta_id", data.id);

        me.fireEvent('clickpoint', record, me)
    },

    onBrushendend: function () {
        // console.log('onBrushendend()')
        var me = this,
            scene = me.getScene(),
            data = me.plotData,
            axisPadding = 0.2;

        me.s = d3.event.selection;

        if (!me.s) {
            if (!me.idleTimeout) return me.idleTimeout = setTimeout(function () {
                me.idleTimeout = null;
            }, me.idleDelay);

            //me.x.domain(d3.extent(data, function (d) { return d.x; })).nice();
            me.y.domain(d3.extent(data, function (d) { return d.y; })).nice();

            me.x.domain([
                d3.min(data, function(s){return d3.min(s.values, function (d) {
                    return d.x - axisPadding;})}),
                d3.max(data, function(s){return d3.max(s.values, function (d) {
                    return d.x + axisPadding;})}),
            ])

            me.y.domain([
                d3.min(data, function(s){return d3.min(s.values, function (d) {
                    return d.y - axisPadding;})}),
                d3.max(data, function(s){return d3.max(s.values, function (d) {
                    return d.y + axisPadding;})}),
            ])

        } else {

            me.x.domain([me.s[0][0], me.s[1][0]].map(me.x.invert, me.x));
            me.y.domain([me.s[1][1], me.s[0][1]].map(me.y.invert, me.y));
            scene.select(".brush").call(me.brush.move, null);
        }
        me.zoom();

    },

    zoom: function () {
        var me = this,
            scene = me.getScene(),
            t;

        t = me.scatter.transition().duration(750);
            d3.select("#axis--x").transition(t).call(me.xAxis);
            d3.select("#axis--y").transition(t).call(me.yAxis);
            me.scatter.selectAll("circle").transition(t)
                .attr("cx", function (d) { return me.x(d.x); })
                .attr("cy", function (d) { return me.y(d.y); });

    }

});