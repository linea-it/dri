import React, { Component } from 'react';
import './Viewer.css';
import { uniqueId } from 'lodash';
import PropTypes from 'prop-types';
import ContextMenu from './ContextMenu';
import ContrastMenu from './ContrastMenu';
import circle from './circle-outline.svg';

const colorRanges = {
  defaultContrast: {
    minMaxValues: [
      // g
      [-0.390453905, 1000],
      // r
      [-1.10961807, 1200],
      // i
      [-1.48952579, 1600],
      // z
      [-2.25479436, 2400],
      // Y
      [-0.990383625, 5000],
      // det
      [0.0486380979, 100],
    ],
  },
  highContrast: {
    minMaxValues: [
      // g
      [-0.390453905, 50],
      // r
      [-1.10961807, 50],
      // i
      [-1.48952579, 50],
      // z
      [-2.25479436, 50],
      // Y
      [-0.990383625, 100],
      // det
      [0.0486380979, 100],
    ],
  },
  mediumContrast: {
    minMaxValues: [
      // g
      [-0.390453905, 500],
      // r
      [-1.10961807, 500],
      // i
      [-1.48952579, 500],
      // z
      [-2.25479436, 500],
      // Y
      [-0.990383625, 1000],
      // det
      [0.0486380979, 100],
    ],
  },
};

class VisiomaticPanel extends Component {
  static propTypes = {
    image: PropTypes.string,
    center: PropTypes.array,
    fov: PropTypes.number,
    contrast: PropTypes.string,
    currentDataset: PropTypes.object,
    points: PropTypes.array,
    reloadData: PropTypes.func,
    hasInspection: PropTypes.bool.isRequired,
    handleDownloadClick: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = this.initialState;

    this.id = uniqueId('visiomatic-container-');

    // Instancia do Visiomatic linkado com a div
    this.visiomatic = null;

    // Verificar se a lib Aladin esta disponivel
    if (window.L) {
      this.libL = window.L;
      // console.log('Leaflet Carregado');
    } else {
      // console.log('Leaflet NÃO CARREGADO!');
    }
  }

  get initialState() {
    return {
      contextMenuOpen: false,
      contextMenuUpdateOpen: false,
      contextMenuEvt: null,
      points: [],
      currentContrast: 'defaultContrast',
      contrastMenuOpen: false,
      preventUpdateContrast: false, // This is a flag to prevent the tile contrast from changing when the image changes
    };
  }

  onLayerAdd = () => {
    this.setView();
  };

  onLayerRemove = () => {
    this.layer = null;
    this.changeImage();
  };

  onContextMenuOpen = (e) => {
    this.setState({
      contextMenuOpen: true,
      contextMenuEvt: e,
    });
  }

  onContextMenuUpdateOpen = (feature, latlng) => {
    const event = {
      ...feature,
      latlng,
    };

    this.setState({
      contextMenuUpdateOpen: true,
      contextMenuEvt: event,
    });
  }

  onContextMenuClose = () => {
    this.setState({
      contextMenuOpen: false,
      contextMenuUpdateOpen: false,
      contextMenuEvt: null,
    });
  }

  redraw = () => {
    const me = this;
    const { map } = me;
    const container = map.getContainer();
    const { width } = container;

    if (width > 0) {
      container.css = `width: ${width} + 2`;
      map.invalidateSize();
      container.css = 'width: initial';
    }
  };

  overlayCatalog = () => {
    const l = this.libL;

    const { map } = this;
    const wcs = map.options.crs;

    const { points } = this.props;

    this.removeImageLayer();

    const features = points.map((comment) => ({
      id: comment.id,
      type: 'Feature',
      owner: comment.owner,
      comment: comment.dts_comment,
      date: comment.dts_date,
      geometry: {
        type: 'Point',
        coordinates: [comment.dts_ra, comment.dts_dec],
      },
      is_owner: comment.is_owner,
    }));

    const collection = {
      type: 'FeatureCollection',
      features,
    };

    const greenIcon = l.icon({
      iconUrl: circle,
      iconSize: [16, 16],
    });

    const popup = (feature) => (
      `<div>
        <h3 style="margin: 0">${feature.comment}</h3>
        <span style="font-size: 11px">reported by: <i><u>${feature.owner}</u></i></span><br />
        <span style="font-size: 11px">date: <i>${feature.date}</i></span>
      </div>`
    );

    // this.removeImageLayer();

    const lCatalog = l.geoJson(collection, {
      coordsToLatLng: (coords) => {
        if (wcs.forceNativeCelsys) {
          const latLng = wcs.eqToCelsys(l.latLng(coords[1], coords[0]));
          return new l.LatLng(latLng.lat, latLng.lng, coords[2]);
        }
        return new l.LatLng(coords[1], coords[0], coords[2]);
      },
      pointToLayer: (feature, latlng) => {
        l.marker(latlng, { icon: greenIcon })
          .bindPopup(popup(feature, latlng))
          .addTo(map)
          .on('contextmenu', () => this.onContextMenuUpdateOpen(feature, latlng));
      },
    });

    // this.redraw();
    map.addLayer(lCatalog);
    return lCatalog;
  };

  onContrastMenuOpen = () => {
    if (this.props.currentDataset) {
      this.setState({
        contrastMenuOpen: true,
      });
    }
  }

  onContrastMenuClose = () => {
    this.setState({
      contrastMenuOpen: false,
    });
  }

  onContrastMenuChange = (e, value) => {
    this.setState({
      contrastMenuOpen: false,
      currentContrast: value,
      preventUpdateContrast: false,
    });
  }

  onDownloadOpen = () => {
    if (this.props.currentDataset) {
      this.props.handleDownloadClick(this.props.currentDataset);
    }
  }

  // showContrastWindow = () => {
  //   this.setState({
  //     contrastWindowOpen: true,
  //     colorRanges,
  //   });

  //   const me = this;
  //   const currentContrast = me.getCurrentContrast();

  //   // TODO: verificar se o valor de currentContrast esta disponivel na lista de Contrasts disponiveis.
  //   if (currentContrast !== null) {

  //     this.setState({
  //       contrastWindowOpen: true,
  //       colorRanges,
  //     });

  //     me.setCurrentContrast(currentContrast);

  //   } else {
  //     return false;
  //   }
  // }

changeContrast = () => {
  const me = this;

  const imageLayer = me.layer;

  const minValues = colorRanges[this.state.currentContrast].minMaxValues.map((v) => v[0]);
  const maxValues = colorRanges[this.state.currentContrast].minMaxValues.map((v) => v[1]);

  imageLayer.iipMinValue = minValues;
  imageLayer.iipMaxValue = maxValues;

  imageLayer.updateMix();
  imageLayer.redraw();
}

componentDidMount() {
  const map = this.libL.map(this.id, {
    fullscreenControl: true,
    zoom: 1,
    enableLineaContrast: true,
    enableLineaDownload: true,
  });

  this.libL.control.scale.wcs({ pixels: false }).addTo(map);
  this.libL.control.reticle().addTo(map);

  this.wcsControl = this.libL.control
    .wcs({
      coordinates: [
        {
          label: 'RA, Dec (Deg)',
          units: 'deg',
        },
        {
          label: 'RA,Dec (HMS)',
          units: 'HMS',
        },
      ],
      position: 'topright',
    })
    .addTo(map);

  // Add a Reticle to Map
  this.libL.control.reticle().addTo(map);

  const sidebar = this.libL.control.sidebar().addTo(map);

  // Channel Mixing
  this.libL.control.iip.channel().addTo(sidebar);

  // Image Preference
  this.libL.control.iip.image().addTo(sidebar);

  map.on('layeradd', this.onLayerAdd, this);
  map.on('layerremove', this.onLayerRemove, this);
  map.on('changecontrast', this.onContrastMenuOpen, this);
  map.on('ondownload', this.onDownloadOpen, this);

  if (this.props.hasInspection) {
    map.on('contextmenu', this.onContextMenuOpen, this);
    map.on('overlaycatalog', this.overlayCatalog, this);
  }
  this.map = map;
  // this.changeImage();
}

  removeImageLayer = () => {
    const me = this;
    const { map } = me;
    // imageLayer = me.getImageLayer();

    if (map !== null) {
      // map.removeLayer(imageLayer);
      // remover todas as layer
      map.eachLayer((layer) => {
        map.removeLayer(layer);
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.image !== this.props.image) {
      this.changeImage();
    }

    if (this.props.hasInspection && prevProps.points !== this.props.points) {
      this.overlayCatalog();
      if (prevProps.points.length > 0 && this.props.points.length > 0) {
        this.setView();
      }
    }

    if (this.props.hasInspection && prevProps.contrast !== this.props.contrast) {
      this.changeImage();
    }

    if (!this.state.preventUpdateContrast && this.state.currentContrast !== prevState.currentContrast) {
      this.changeContrast();
    }
  }

  setView = () => {
    const { center } = this.props;
    let { fov } = this.props;

    if (center && center.length > 0) {
      const ra = parseFloat(parseFloat(center[0]).toFixed(5)) || 0;
      const dec = parseFloat(parseFloat(center[1]).toFixed(5)) || 0;
      const latlng = this.libL.latLng(dec, ra);

      if (!fov) {
        fov = 2;
      }

      this.map.setView(
        latlng,
        this.map.options.crs.fovToZoom(this.map, fov, latlng),
      );

      // Este comando corrige a demora no load. forcando o redraw.

      this.map.invalidateSize();
    }
  };

  getColorRanges = () => {
    const { contrast } = this.props;

    if (contrast) {
      return colorRanges[contrast];
    }
    return colorRanges.defaultContrast;
  };

  changeImage = () => {
    if (this.props.image) {
      if (this.layer) {
        this.map.removeLayer(this.layer);
        return;
      }

      let url = this.props.image;

      // TODO: Deve ser removido solucao temporaria
      url = url.replace('http://', 'https://');

      const currentColorRanges = this.getColorRanges();

      this.layer = this.libL.tileLayer
        .iip(url, {
          credentials: process.env.REACT_APP_VISIOMATIC_CREDENTIAL === 'true',
          center: false,
          fov: false,
          // center: latlng,
          // fov: this.props.fov,
          mixingMode: 'color',
          defaultChannel: 2,
          contrast: 0.7,
          gamma: 2.8,
          colorSat: 2.0,
          quality: 100,
          channelLabelMatch: '[ugrizY]',
          minMaxValues: currentColorRanges.minMaxValues,
          // minMaxValues: [
          //   // g
          //   [-0.390453905, 1000],
          //   // r
          //   [],
          //   // i
          //   [],
          //   // z
          //   [],
          //   // Y
          //   [-0.990383625, 5000],
          //   // det
          //   [],
          // ],
        })
        .addTo(this.map);

      this.setState({
        currentContrast: 'defaultContrast',
        preventUpdateContrast: true,
      });
    } else if (this.layer) {
      this.map.removeLayer(this.layer);
    }
  };

  // Convert degrees to HMSDMS (DMS code from the Leaflet-Coordinates plug-in)
  latLngToHMSDMS = (latlng) => {
    let lng = (latlng.lng + 360.0) / 360.0;
    lng = (lng - Math.floor(lng)) * 24.0;
    let h = Math.floor(lng);

    let mf = (lng - h) * 60.0;

    let m = Math.floor(mf);

    let sf = (mf - m) * 60.0;
    if (sf >= 60.0) {
      m++;
      sf = 0.0;
    }
    if (m === 60) {
      h++;
      m = 0;
    }
    const str = `${(h < 10 ? '0' : '') + h.toString()}:${m < 10 ? '0' : ''}${m.toString()
    }:${sf < 10.0 ? '0' : ''}${sf.toFixed(3)}`;

    const lat = Math.abs(latlng.lat);

    const sgn = latlng.lat < 0.0 ? '-' : '+';

    const d = Math.floor(lat);
    mf = (lat - d) * 60.0;
    m = Math.floor(mf);
    sf = (mf - m) * 60.0;
    if (sf >= 60.0) {
      m++;
      sf = 0.0;
    }
    if (m === 60) {
      h++;
      m = 0;
    }
    return `${str} ${sgn}${d < 10 ? '0' : ''}${d.toString()}:${
      m < 10 ? '0' : ''}${m.toString()}:${
      sf < 10.0 ? '0' : ''}${sf.toFixed(2)}`;
  }

  render() {
    const { hasInspection } = this.props;

    const toolbar = 64;
    const footer = 64;
    const padding = 21;

    // Ajuste no Tamanho do container
    return (
      <>
        <div
          id={this.id}
          className="visiomatic-container"
          style={{
            width: '100%',
            height: window.innerHeight - toolbar - footer - padding,
            // height: '100%',
          }}
        />
        {hasInspection ? (
          <ContextMenu
            open={this.state.contextMenuOpen}
            updateOpen={this.state.contextMenuUpdateOpen}
            event={this.state.contextMenuEvt}
            handleClose={this.onContextMenuClose}
            currentDataset={this.props.currentDataset ? this.props.currentDataset.id : null}
            latLngToHMSDMS={this.latLngToHMSDMS}
            getDatasetCommentsByType={this.props.getDatasetCommentsByType}
            reloadData={this.props.reloadData}
          />
        ) : null}
        <ContrastMenu
          open={this.state.contrastMenuOpen}
          currentContrast={this.state.currentContrast}
          handleChange={this.onContrastMenuChange}
          handleClose={this.onContrastMenuClose}
        />
      </>
    );
  }
}

export default VisiomaticPanel;
