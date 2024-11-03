import dayjs from "@/util/dayjs.helper";

const validatePublicationDate = (createdAt: string) => {
  const today = dayjs.utc();
  const publish = dayjs(createdAt).utc();

  return today.isAfter(publish);
};

export default validatePublicationDate;
