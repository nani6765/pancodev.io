import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import 'dayjs/locale/ko';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Seoul');
dayjs.locale('ko');

const validatePublicationDate = (createdAt: string) => {
  const today = dayjs();
  const publish = dayjs(createdAt)
  
  console.log('today : ', today.format('YYYY-MM-DD HH:mm'));
  console.log('publish : ', publish.format('YYYY-MM-DD HH:mm'));
  
  return today.isAfter(publish);
};

export default validatePublicationDate;
