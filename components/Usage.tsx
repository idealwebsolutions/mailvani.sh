import Box from '@material-ui/core/Box';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import prettyBytes from 'pretty-bytes';

interface Props {
  readonly enabled: boolean,
  readonly maxAllocated: number,
  readonly currentUsage: number
};

export default function Usage (props: Props) {
  const progressValue: number = props.enabled ? (props.currentUsage / props.maxAllocated) * 100 : 0
  return (
    <div>
      <Box width="85%" ml={2} mr={2} mb={1}>
        <LinearProgress color="secondary" variant="determinate" value={progressValue} />
      </Box>
      <Box width="85%" ml={2} mr={2}>
        <Typography variant="body2" color="textSecondary">
          {`${prettyBytes(props.currentUsage)} / ${prettyBytes(props.maxAllocated)}`}
        </Typography>
      </Box>
    </div>
  );
}
