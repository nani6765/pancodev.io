import dayjs from "@/util/dayjs.helper";

const validatePublicationDate = (createdAt: string) => {
  const today = dayjs.utc();
  const publish = dayjs(createdAt);
  const convertPublishToUTC = publish.subtract(9, "hours").utc();

  return today.isAfter(convertPublishToUTC);
};

export default validatePublicationDate;
