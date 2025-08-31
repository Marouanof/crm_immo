const InputLabel = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      position: 'static',
      transform: 'none',
      transition: 'none',
      fontSize: theme.typography.body1.fontSize,
      fontWeight: theme.typography.body1.fontWeight,
      '&.Mui-focused': {
        color: theme.palette.text.secondary,
      },
    }),
    focused: ({ theme }) => ({
      color: theme.palette.text.secondary,
      position: 'static',
      transform: 'none',
      transition: 'none',
    }),
  },
};

export default InputLabel;
