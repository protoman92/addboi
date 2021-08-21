import axios from "axios";

const _ = async () => {
  await Promise.all([axios.request({ baseURL: process.env.ADDBOI_URL })]);
};

export default _;
