import dayjs from "@/util/dayjs.helper";

const validatePublicationDate = (createdAt: string) => {
  const today = dayjs(new Date());
  console.log(today.format("YYYY-MM-DD HH:mm:ss"));
  const publish = dayjs(createdAt);
  return today.isAfter(publish);
};

export default validatePublicationDate;
