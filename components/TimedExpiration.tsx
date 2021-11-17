import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

import Countdown from './Countdown';

interface Props {
  readonly initialDuration: number,
  readonly enabled: boolean
}

export default function TimedExpiration (props: Props) {
  const [duration, setDuration] = useState<number>(0);

  // console.log('initial duration ' + props.initialDuration)

  useEffect(() => {
    if (props.enabled && props.initialDuration > 0 && duration === 0) {
      const timestamp: Dayjs = dayjs.unix(props.initialDuration);
      const now: Dayjs = dayjs();
      const nextDuration: number = timestamp.diff(now) / 1000;
      // console.log('setting duration to ' + nextDuration);
      setDuration(nextDuration);
    }
  });

  if (!props.enabled || duration === 0) {
    return null;
  }

  return <Countdown enabled={props.enabled} duration={duration} />
}
