import { useElapsedTime } from 'use-elapsed-time';
import Chip from '@material-ui/core/Chip';
import TimerIcon from '@material-ui/icons/Timer';

interface Props {
  readonly duration: number,
  readonly enabled: boolean
}

export default function Countdown (props: Props) {
  if (!props.enabled) {
    return null;
  }

  const startAt = !props.enabled && props.duration > 0 ? 0 : undefined;

  const { elapsedTime } = useElapsedTime({
    duration: props.duration || 0, // props.duration || 0
    isPlaying: props.enabled && props.duration > 0, // props.duration
    updateInterval: 1,
    startAt
  });

  const remainingMinutes: number = props.duration <= 0 ? 0 : Math.ceil(Math.ceil(props.duration - elapsedTime) / 60);

  // console.log('elapsed time: ' + elapsedTime)
  // console.log('remaining minutes: ' + remainingMinutes)

  if (!props.enabled || remainingMinutes <= 0) {
    return null;
  }

  return (<Chip color="secondary" label={`${ remainingMinutes }m`} icon={<TimerIcon />} />);
}
