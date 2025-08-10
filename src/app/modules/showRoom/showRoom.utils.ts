import mongoose from "mongoose";

interface ShowRoomIdResult {
  showRoomId?: string;
}

const findLastShowRoomId = async (ShowRoomModel: mongoose.Model<any>) => {
  const lastShowRoom = await ShowRoomModel.findOne<ShowRoomIdResult>({}, { showRoomId: 1 })
    .sort({ createdAt: -1 })
    .lean();

  return lastShowRoom?.showRoomId
    ? lastShowRoom.showRoomId.substring(6)
    : undefined;
};

export const generateShowRoomId = async (
  ShowRoomModel: mongoose.Model<any>
) => {
  const currentId = (await findLastShowRoomId(ShowRoomModel)) || '0000';
  const incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  return `TAS:03${incrementId}`;
};
