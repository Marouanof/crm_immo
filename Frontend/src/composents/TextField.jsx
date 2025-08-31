import pxToRem from '../functions/px-to-rem';

const TextField = {
  defaultProps: {
    variant: 'filled',
  },
  styleOverrides: {
    root: {
      gap: pxToRem(10),
    },
  },
};

export default TextField;
