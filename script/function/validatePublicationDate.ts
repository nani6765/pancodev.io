import dayjs from "dayjs";

const validatePublicationDate = (createdAt: string) => {
  const today = dayjs();
  const publish = dayjs(createdAt);
  return today.isAfter(publish);
};

export default validatePublicationDate;
