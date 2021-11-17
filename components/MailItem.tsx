import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import {
  makeStyles,
  createStyles,
  Theme
} from '@material-ui/core/styles';
import {
  useContext
} from 'react';
import dayjs from 'dayjs';

import { ThemeSettingsContext } from '../context/Theme';
import { NameAddressPair } from '../data/types';
import { MailPropertiesContext } from '../context/MailProperties';

// TODO: use theme.spacing
const useStyles = (isDarkTheme: boolean) => makeStyles((theme: Theme) => createStyles({
  inline: {
    display: 'inline',
    fontWeight: 600,
  },
  newState: {
    backgroundColor: isDarkTheme ? '#424242' : '#fff', // TODO: change color for dark theme
    color: isDarkTheme ? 'grey' : 'inherit'
  },
  openedState: {
    backgroundColor: 'none'
  },
  contentListItem: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    width: theme.breakpoints.values.md,
    [theme.breakpoints.only('md')]: {
      width: theme.breakpoints.values.sm
    },
    [theme.breakpoints.down('sm')]: { // TODO: Needs to be tweaked a bit more
      width: 380,
      whiteSpace: 'normal',
      display: '-webkit-box',
      '-webkitLineClamp': 2,
      '-webkitBoxOrient': 'vertical'
    },
    [theme.breakpoints.only('xs')]: {
      width: 220
    }
  }
}));

interface Props {
  readonly id: number | string,
  readonly from: Array<NameAddressPair>,
  readonly subject: string,
  readonly date: Date,
  readonly body: {
    readonly plain: string,
    readonly html: string | boolean
  },
  readonly opened: boolean,
}

export default function Mail (props: Props) {
  const themeCtx = useContext(ThemeSettingsContext);
  const mailPropsCtx = useContext(MailPropertiesContext);
  const classes = useStyles(themeCtx.isDarkTheme)();
  
  return (
    <ListItem button divider className={props.opened ? classes.openedState : classes.newState} onClick={() => mailPropsCtx.changeOpened(props.id as number)}>
      <ListItemAvatar>
        <Avatar>{ props.from[0].name[0] }</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Grid container direction="row" justify="space-between" alignItems="center">
            <Grid item xs={9} sm={10} md={10} lg={11}>
              <Typography component="span" className={classes.inline} color="textPrimary">
                { parseNames(props.from) }
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography component="span" variant="overline" className={classes.inline} color="textPrimary">
                { formatDate(props.date) }
              </Typography>
            </Grid>
          </Grid>
        }
        secondary={
          <div className={classes.contentListItem}>
            <Typography
              component="span"
              variant="body2"
              className={classes.inline}
              color="textPrimary"
            >
              { props.subject }
            </Typography>
            {` — ${props.body.plain}`}
          </div>
        }
      />
    </ListItem>
  );
}

// Helper functions (TODO: needs to be more to util)
function formatDate (date: Date): string {
  const prev: dayjs.Dayjs = dayjs(date);
  return prev.format(dayjs().diff(prev, 'hours') >= 24 ? 'MMM D' : 'hh:mm a');
}
function parseNames (na: Array<NameAddressPair>): string {
  return na.map((p: NameAddressPair) => p.name).join(', ');
}
