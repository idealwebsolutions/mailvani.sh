import { 
  createMuiTheme, 
  Theme 
} from '@material-ui/core/styles';
import { red, grey } from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Brightness3Icon from '@material-ui/icons/Brightness3';
import BrightnessHighIcon from '@material-ui/icons/BrightnessHigh';

// light theme
export const lightTheme: Theme = createMuiTheme({
  typography: {
    h4: {
      fontFamily: 'Quicksand',
      fontWeight: 700
    }
  },
  palette: {
    primary: {
      main: '#fff',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: 'rgba(243,244,246,0.6)' //grey[50],
    },
  },
});

export const darkTheme: Theme = createMuiTheme({
  typography: {
    h4: {
      fontFamily: 'Quicksand',
      fontWeight: 700
    },
  },
  palette: {
    type: 'dark',
    primary: {
      main: '#424242'
    }
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        a: {
          color: 'red'
        }
      }
    }
  }
});

interface Props {
  isDarkTheme: boolean,
  toggle: Function
}

export function ThemeToggle (props: Props) {
  return (
    <Tooltip title={props.isDarkTheme ? 'Light Theme' : 'Dark Theme'}>
      <IconButton color="inherit" onClick={() => props.toggle()}>
        {
          props.isDarkTheme ? <BrightnessHighIcon /> : <Brightness3Icon /> 
        }
      </IconButton>
    </Tooltip>
  )
}

