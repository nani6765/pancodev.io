import dayjs from "@/util/dayjs.helper";

const validatePublicationDate = (createdAt: string) => {
  const today = dayjs(new Date());
  const publish = dayjs(createdAt);
  return today.isAfter(publish);
};

export default validatePublicationDate;
