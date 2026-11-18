import { push, ref, serverTimestamp } from 'firebase/database';
import { applyUpdates, buildMessageUpdates, getMemberIds } from './chatService';
import { db } from './firebase';
import { notificationUpdate } from './notificationService';
import { ConversationInfo, User } from './types';

export const MIN_GROUP_MEMBERS = 2;

const nameOf = (users: User[], uid: string) => users.find(u => u.id === uid)?.name ?? 'Một thành viên';
const namesOf = (users: User[], uids: string[]) => uids.map(uid => nameOf(users, uid)).join(', ');

function groupAddedNotifications(conv: ConversationInfo, fromUid: string, uids: string[], users: User[]) {
  return uids.reduce(
    (acc, uid) => ({
      ...acc,
      ...notificationUpdate(uid, {
        type: 'group',
        convId: conv.id,
        fromUid,
        text: `${nameOf(users, fromUid)} đã thêm bạn vào nhóm "${conv.name}"`,
      }),
    }),
    {},
  );
}

// Tạo nhóm, tin hệ thống, userChats và thông báo cho từng thành viên trong một lần ghi
export async function createGroup(myId: string, name: string, memberIds: string[], users: User[]) {
  const others = memberIds.filter(uid => uid !== myId);
  if (others.length < MIN_GROUP_MEMBERS) {
    throw new Error(`Nhóm cần tối thiểu ${MIN_GROUP_MEMBERS} thành viên ngoài bạn`);
  }
  const convId = push(ref(db, 'conversations')).key as string;
  const members: Record<string, true> = { [myId]: true };
  others.forEach(uid => {
    members[uid] = true;
  });
  const conv: ConversationInfo = {
    id: convId,
    type: 'group',
    name: name.trim(),
    members,
    createdBy: myId,
    createdAt: Date.now(),
  };
  const { updates } = buildMessageUpdates(
    conv,
    myId,
    { type: 'system', text: `${nameOf(users, myId)} đã tạo nhóm "${conv.name}"` },
    { users },
  );
  await applyUpdates({
    [`conversations/${convId}`]: {
      type: 'group',
      name: conv.name,
      members,
      createdBy: myId,
      createdAt: serverTimestamp(),
    },
    ...updates,
    ...groupAddedNotifications(conv, myId, others, users),
  });
  return convId;
}

export function renameGroup(conv: ConversationInfo, myId: string, name: string, users: User[]) {
  const renamed = { ...conv, name: name.trim() };
  const { updates } = buildMessageUpdates(
    renamed,
    myId,
    { type: 'system', text: `${nameOf(users, myId)} đã đổi tên nhóm thành "${renamed.name}"` },
    { users },
  );
  return applyUpdates({ [`conversations/${conv.id}/name`]: renamed.name, ...updates });
}

export function addMembers(conv: ConversationInfo, myId: string, uids: string[], users: User[]) {
  const members = [...getMemberIds(conv), ...uids.filter(uid => !conv.members[uid])];
  const updates: Record<string, unknown> = {};
  uids.forEach(uid => {
    updates[`conversations/${conv.id}/members/${uid}`] = true;
  });
  const message = buildMessageUpdates(
    conv,
    myId,
    { type: 'system', text: `${nameOf(users, myId)} đã thêm ${namesOf(users, uids)} vào nhóm` },
    { members, users },
  );
  return applyUpdates({
    ...updates,
    ...message.updates,
    ...groupAddedNotifications(conv, myId, uids, users),
  });
}

export function removeMember(conv: ConversationInfo, myId: string, uid: string, users: User[]) {
  const members = getMemberIds(conv).filter(m => m !== uid);
  const { updates } = buildMessageUpdates(
    conv,
    myId,
    { type: 'system', text: `${nameOf(users, myId)} đã xóa ${nameOf(users, uid)} khỏi nhóm` },
    { members, users },
  );
  return applyUpdates({
    ...updates,
    [`conversations/${conv.id}/members/${uid}`]: null,
    [`userChats/${uid}/${conv.id}`]: null,
  });
}

// Tin hệ thống "A đã rời nhóm" được ghi cùng lúc với việc xóa mình khỏi nhóm
export function leaveGroup(conv: ConversationInfo, myId: string, users: User[]) {
  const members = getMemberIds(conv).filter(m => m !== myId);
  const { updates } = buildMessageUpdates(
    conv,
    myId,
    { type: 'system', text: `${nameOf(users, myId)} đã rời nhóm` },
    { members, users },
  );
  return applyUpdates({
    ...updates,
    [`conversations/${conv.id}/members/${myId}`]: null,
    [`userChats/${myId}/${conv.id}`]: null,
    [`readStatus/${conv.id}/${myId}`]: null,
  });
}
