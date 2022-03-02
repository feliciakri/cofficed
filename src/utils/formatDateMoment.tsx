import moment from "moment";

export const changeToDate = (e: Date | string) => {
  const datese = moment(e).format("L");
  return datese;
};
