import React, { Component } from 'react';
import './Viewer.css';
import { uniqueId } from 'lodash';
import PropTypes from 'prop-types';

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
    return {};
  }

  onLayerAdd = () => {
    this.setView();
  };

  onLayerRemove = () => {
    this.layer = null;
    this.changeImage();
  };

  onContextMenuClick = (event) => {
    // const map = this.getMap();
    // const target = event.target;

    const xy = {
      x: event.originalEvent.clientX,
      y: event.originalEvent.clientY,
    };

    let contextMenu;

    if (this.cancelBuble) return;
    this.cancelBuble = true;
    setTimeout(() => { this.cancelBuble = false; }, 100);
    this.libL.map(this.id, { fullscreenControl: true, zoom: 1 });
    if (this.getEnableContextMenu()) {
      contextMenu = this.makeContextMenu(event);
      contextMenu.showAt(xy);
    }
  }


  componentDidMount() {
    const map = this.libL.map(this.id, { fullscreenControl: true, zoom: 1 });

    this.libL.control.scale.wcs({ pixels: false }).addTo(map);
    this.libL.control.reticle().addTo(map);

    this.wcsControl = this.libL.control
      .wcs({
        coordinates: [{ label: 'RA,Dec', units: 'HMS' }],
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
    map.on('contextmenu', this.onContextMenuClick, this);

    this.map = map;

    this.changeImage();
  }

  componentDidUpdate() {
    this.changeImage();
  }

  setView = () => {
    // console.log('setView()');
    const { center } = this.props;
    let { fov } = this.props;

    if (center && center.length > 0) {
      const ra = parseFloat(parseFloat(center[0]).toFixed(5));
      const dec = parseFloat(parseFloat(center[1]).toFixed(5));
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

      const colorRanges = this.getColorRanges();

      this.layer = this.libL.tileLayer
        .iip(url, {
          credentials: true,
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
          minMaxValues: colorRanges.minMaxValues,
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
    } else if (this.layer) {
      this.map.removeLayer(this.layer);
    }
  };

  render() {
    // Ajuste no Tamanho do container
    return (
      <div
        id={this.id}
        className="visiomatic-container"
        style={{
          width: '100%',
          height: 'calc(100vh - 150px)',
          // height: '100%',
        }}
      />
    );
  }
}

export default VisiomaticPanel;
