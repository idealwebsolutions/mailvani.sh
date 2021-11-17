import {
  makeStyles,
  createStyles,
  Theme
} from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
// import Snackbar from '@material-ui/core/Snackbar';
import Tooltip from '@material-ui/core/Tooltip';
// import Slide from '@material-ui/core/Slide';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { useState } from 'react';
import {
  CopyToClipboard
} from 'react-copy-to-clipboard';

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    display: 'flex',
    width: '100%'
  },
  alias: {
    [theme.breakpoints.down('sm')]: {
      fontSize: theme.typography.pxToRem(15)
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: theme.typography.pxToRem(11.5),
      marginRight: 8
    },
    minWidth: 120,
    marginLeft: 6,
    marginRight: 6
  }
}));

/*function TransitionUp (props) {
  return <Slide {...props} direction="up" />;
}*/

interface Props {
  readonly enabled: boolean,
  readonly alias: string | null
}

export default function AliasAddress (props: Props) {
  const classes = useStyles();
  const [copied, setCopied] = useState<boolean>(false);
  return (
    <>
      <Typography variant="h6" color="inherit" className={classes.alias}>
        { props.enabled && props.alias ? props.alias : <Skeleton /> }
      </Typography>
      <CopyToClipboard text={props.alias} onCopy={() => setCopied(true)}>
        {
          !props.alias || !props.enabled ? 
          <IconButton color="inherit" aria-label="copy alias to clipboard" disabled={!props.enabled || !props.alias} disableRipple={!props.alias}>
            <FileCopyIcon />
          </IconButton> : 
          <Tooltip title="Copy Address">
            <IconButton color="inherit" aria-label="copy alias to clipboard" disableRipple={!props.alias}>
              <FileCopyIcon />
            </IconButton>
          </Tooltip>
        }
      </CopyToClipboard>
      {/*<Snackbar
        open={copied}
        onClose={() => setCopied(false)}
        TransitionComponent={TransitionUp}
        autoHideDuration={2500}
        message={`${props.alias} was copied to clipboard`}
      />*/}
    </>
  );
};
