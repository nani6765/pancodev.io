import dayjs from "dayjs";

const validatePublicationDate = (createdAt: string) => {
  const today = dayjs(new Date().toLocaleDateString('ko-kr'));
  const publish = dayjs(createdAt)
  
  console.log('today : ', today.format('YYYY-MM-DD HH:mm'));
  console.log('publish : ', publish.format('YYYY-MM-DD HH:mm'));
  
  return today.isAfter(publish);
};

export default validatePublicationDate;
