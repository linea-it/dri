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

  componentDidMount() {
    const map = this.libL.map(this.id, { fullscreenControl: true, zoom: 1 });

    this.libL.control.scale.wcs({ pixels: false }).addTo(map);
    this.libL.control.reticle().addTo(map);

    const wcsControl = this.libL.control
      .wcs({
        coordinates: [{ label: 'RA,Dec', units: 'HMS' }],
        position: 'topright',
      })
      .addTo(map);

    this.map = map;

    this.changeImage();
  }

  componentDidUpdate(nextProps) {
    this.changeImage();
  }

  changeImage = () => {
    if (this.props.image) {
      if (this.layer) {
        this.map.removeLayer(this.layer);
      }

      // var url = `${window.origin}/iipserver?FIF=${
      //   this.props.image
      //   }&WID=2000&CVT=jpeg`;

      let url = this.props.image;

      // TODO: Deve ser removido solucao temporaria
      url = url.replace('http', 'https');

      const ra = parseFloat(parseFloat(this.props.center[0]).toFixed(5));
      const dec = parseFloat(parseFloat(this.props.center[1]).toFixed(5));
      const latlng = this.libL.latLng(dec, ra);

      this.layer = this.libL.tileLayer
        .iip(url, {
          credentials: true,
          center: latlng,
          fov: this.props.fov,
          mixingMode: 'color',
          defaultChannel: 2,
          contrast: 0.7,
          gamma: 2.8,
          colorSat: 2.0,
          channelLabelMatch: '[ugrizY]',
        })
        .addTo(this.map);

      // if (this.props.center && this.props.center.lenght > 0) {
      //   const ra = parseFloat(parseFloat(this.props.center[0]).toFixed(5));
      //   const dec = parseFloat(parseFloat(this.props.center[1]).toFixed(5));

      //   const latlng = this.libL.latLng(dec, ra);
      //   this.map.setView(
      //     latlng,
      //     this.map.options.crs.fovToZoom(this.map, this.props.fov, latlng)
      //   );
      // }
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
