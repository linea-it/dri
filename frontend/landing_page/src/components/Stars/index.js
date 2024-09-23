import React from 'react';
import Particles from 'react-particles-js';
import styles from './styles';

function Stars() {
  const classes = styles();

  return (
    <Particles
      className={classes.particlesWrapper}
      params={{
        particles: {
          number: {
            value: 100,
            density: {
              enable: true,
              value_area: 1000,
            },
          },
          color: {
            value: '#ffffff',
          },
          opacity: {
            value: 0.6,
            random: false,
            anim: {
              enable: true,
              speed: 0.7,
              opacity_min: 0,
              sync: false,
            },
          },
          size: {
            value: 2,
            random: true,
            anim: {
              enable: true,
              speed: 4,
              size_min: 0,
              sync: false,
            },
          },
          line_linked: {
            enable: false,
            distance: 150,
            color: '#ffffff',
            opacity: 0.6,
            width: 1,
          },
          move: {
            enable: true,
            speed: 0.8,
            direction: 'none',
            random: true,
            straight: false,
            out_mode: 'out',
            bounce: false,
            attract: {
              enable: false,
              rotateX: 600,
              rotateY: 1200,
            },
          },
        },
        retina_detect: true,
      }}
    />
  );
}

export default Stars;
