import dayjs from "@/util/dayjs.helper";

const validatePublicationDate = (createdAt: string) => {
  const today = dayjs.utc();
  const publish = dayjs(createdAt).utc();
  console.log("today : ", today.format("YYYY-MM-DD HH:mm"));
  console.log("publish : ", publish.format("YYYY-MM-DD HH:mm"));

  return today.isAfter(publish);
};

export default validatePublicationDate;
