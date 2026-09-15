const HR_THRESHOLD = 120;
const GSR_THRESHOLD = 0.7;
const RESP_THRESHOLD = 25;
const MOTION_FLAG = "low";

const detectDistress = (readingData) => {
  let flags = 0;

  if (readingData.heartRate > HR_THRESHOLD) flags++;
  if (readingData.gsr > GSR_THRESHOLD) flags++;
  if (readingData.respiration > RESP_THRESHOLD) flags++;
  if (readingData.motionLevel === MOTION_FLAG) flags++;

  return flags >= 2;
};

module.exports = {
  detectDistress
};
