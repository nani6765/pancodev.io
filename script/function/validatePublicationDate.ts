import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import 'dayjs/locale/ko';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Seoul');

const validatePublicationDate = (createdAt: string) => {
  const today = dayjs();
  const publish = dayjs(createdAt);
  return today.isAfter(publish);
};

export default validatePublicationDate;
