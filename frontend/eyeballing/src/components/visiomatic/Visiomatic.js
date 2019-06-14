import React, { Component } from 'react';
import './Viewer.css';
import { uniqueId } from 'lodash';
import PropTypes from 'prop-types';
class VisiomaticPanel extends Component {
  static propTypes = {
    image: PropTypes.string,
    center: PropTypes.array,
    fov: PropTypes.number,
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
      console.log('Leaflet Carregado');
    } else {
      console.log('Leaflet NÃO CARREGADO!');
    }
  }

  get initialState() {
    return {};
  }

  onLayerAdd = e => {
    console.log('event onLayerAdd(%o)', e);

    this.setView();
  };

  onLayerRemove = e => {
    console.log('event onLayerRemove(%o)', e);
    this.layer = null;
    this.changeImage();
  };

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

    this.map = map;

    this.changeImage();
  }

  componentDidUpdate(nextProps) {
    this.changeImage();
  }

  setView = () => {
    console.log('setView()');
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
        this.map.options.crs.fovToZoom(this.map, fov, latlng)
      );

      // Este comando corrige a demora no load. forcando o redraw.
      this.map.invalidateSize();
    }
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
          channelLabelMatch: '[ugrizY]',
        })
        .addTo(this.map);
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
