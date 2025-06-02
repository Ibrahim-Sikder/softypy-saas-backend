import { ShowRoom } from './showRoom.model';

const findLastShowRoomId = async () => {
  const lastShowRoom = await ShowRoom.findOne(
    {},
    {
      showRoomId: 1,
    },
  )
    .sort({ createdAt: -1 })
    .lean();

  return lastShowRoom?.showRoomId
    ? lastShowRoom?.showRoomId.substring(6)
    : undefined;
};

export const generateShowRoomId = async () => {
  const currentId = (await findLastShowRoomId()) || '0000';
  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  incrementId = `TAS:03${incrementId}`;
  return incrementId;
};
