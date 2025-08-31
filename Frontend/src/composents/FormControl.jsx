import pxToRem from '../functions/px-to-rem';

const FormControl = {
  defaultProps: {},
  styleOverrides: {
    root: () => ({
      gap: pxToRem(10),
    }),
  },
};

export default FormControl;
