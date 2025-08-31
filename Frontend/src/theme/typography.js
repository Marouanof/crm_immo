import pxToRem from '../functions/px-to-rem';

const typography = {
  fontFamily: ['Roboto', 'sans-serif'].join(','),

  h1: {
    fontSize: pxToRem(40),
    fontWeight: 700,
    fontFamily: 'Roboto, sans-serif',
  },
  h2: {
    fontSize: pxToRem(32),
    fontWeight: 700,
    fontFamily: 'Roboto, sans-serif',
  },
  h3: {
    fontSize: pxToRem(28),
    fontWeight: 600,
    fontFamily: 'Roboto, sans-serif',
  },
  h4: {
    fontSize: pxToRem(24),
    fontWeight: 600,
    fontFamily: 'Roboto, sans-serif',
  },
  h5: {
    fontSize: pxToRem(20),
    fontWeight: 500,
    fontFamily: 'Roboto, sans-serif',
  },
  h6: {
    fontSize: pxToRem(18),
    fontWeight: 500,
    fontFamily: 'Roboto, sans-serif',
  },

  subtitle1: {
    fontSize: pxToRem(16),
    fontWeight: 500,
    fontFamily: 'Roboto, sans-serif',
  },
  subtitle2: {
    fontSize: pxToRem(14),
    fontWeight: 400,
    fontFamily: 'Roboto, sans-serif',
  },

  body1: {
    fontSize: pxToRem(14),
    fontWeight: 400,
    fontFamily: 'Roboto, sans-serif',
  },
  body2: {
    fontSize: pxToRem(12),
    fontWeight: 400,
    fontFamily: 'Roboto, sans-serif',
  },

  caption: {
    fontFamily: 'Roboto, sans-serif',
    fontSize: pxToRem(11),
  },
  button: {
    fontFamily: 'Roboto, sans-serif',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
};

export default typography;
