import dayjs from "@/util/dayjs.helper";

const validatePublicationDate = (createdAt: string) => {
  const today = dayjs.utc();
  const publish = dayjs(createdAt).utc();
  console.log("today : ", today.format("YYYY-MM-DD"));
  console.log("publish : ", publish.format("YYYY-MM-DD"));

  return today.isAfter(publish);
};

export default validatePublicationDate;
