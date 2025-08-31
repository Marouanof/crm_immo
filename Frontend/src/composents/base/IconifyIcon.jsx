import { Box } from '@mui/material';
import { Icon } from '@iconify/react';

const IconifyIcon = ({ icon, width, height, ...rest }) => {
  return (
    <Box component={Icon} icon={icon} {...rest} width={width} height={height} />
  );
};

export default IconifyIcon;
