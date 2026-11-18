# TH05 - ChatMate (chat nhóm, gửi ảnh, đã xem, thu hồi)

Đây là ứng dụng chat React Native CLI dùng Firebase Realtime Database, phát triển tiếp từ [TH04](../TH04). Bài này bổ sung chat nhóm, gửi ảnh qua Cloudinary, trạng thái "đang soạn tin…" và "Đã xem", thu hồi tin, thả cảm xúc, cùng màn hình Thông báo dùng dữ liệu thật.

## 1. Cài đặt

Cần Node.js 22.11 trở lên, Android Studio (có Android SDK) và JDK 17-21.

```sh
cd TH05
npm install
```

Các thư viện mới so với TH04:

| Thư viện | Dùng cho |
| --- | --- |
| `react-native-image-picker` | Chụp ảnh / chọn ảnh, thu nhỏ ảnh (cạnh dài ≤ 1024px) |
| `@react-native-clipboard/clipboard` | Sao chép nội dung tin nhắn |
| `@notifee/react-native` | Thông báo cục bộ khi app chạy nền |

## 2. Cấu hình Firebase

1. Vào <https://console.firebase.google.com>, tạo project mới. Có thể dùng lại project của TH04, nhưng luật bảo mật mới không còn tương thích với TH04 (xem lưu ý bên dưới).
2. Vào **Build > Authentication > Sign-in method** và bật **Email/Password**.
3. Vào **Build > Realtime Database > Create Database** và chọn **Start in locked mode**.
4. Mở tab **Rules**, dán toàn bộ nội dung [database.rules.json](database.rules.json) rồi bấm **Publish**.
5. Vào **Project settings > Your apps > Web `</>`** và đăng ký app. Chép `firebaseConfig` vào [src/services/firebaseConfig.ts](src/services/firebaseConfig.ts). Nếu thiếu `databaseURL`, lấy URL ở tab **Data** của Realtime Database.

> **Lưu ý khi dùng chung project với TH04:** sau khi publish luật mới, app TH04 sẽ bị từ chối ghi, vì `userChats` của TH04 dùng khóa là uid và trường `unreadCount`. App TH05 bỏ qua dữ liệu `userChats` cũ, còn tin nhắn 1-1 cũ vẫn đọc được vì `messages/{chatId}` giữ nguyên định dạng id.

## 3. Cấu hình Cloudinary (unsigned upload)

1. Đăng ký tài khoản tại <https://cloudinary.com>. **Cloud name** hiển thị ở trang Dashboard.
2. Vào **Settings (bánh răng) > Upload > Upload presets > Add upload preset**:
   - **Signing mode**: chọn **Unsigned**.
   - Có thể đặt **Folder** là `chatmate`, và giới hạn định dạng ở **Allowed formats** là `jpg,png,webp,heic`.
   - Bấm **Save** rồi chép tên preset.
3. Điền vào [src/services/cloudinaryConfig.ts](src/services/cloudinaryConfig.ts):

```ts
export const cloudinaryConfig = {
  cloudName: 'ten-cloud-cua-ban',
  uploadPreset: 'ten-preset-unsigned',
  folder: 'chatmate',
};
```

**Không** đưa `API secret` vào mã nguồn. App chỉ gửi `upload_preset` (unsigned) lên `https://api.cloudinary.com/v1_1/<cloudName>/image/upload`, rồi chỉ lưu `secure_url` vào Realtime Database. Nếu chưa cấu hình, ảnh sẽ báo lỗi tải lên và hiện nút **Thử lại**.

## 4. Chạy app

```sh
npm start                    # Terminal 1: Metro
npx react-native run-android # Terminal 2: build và cài lên mọi máy ảo đang chạy
```

Muốn thử chat nhóm thì cần ít nhất 3 tài khoản. Có thể chạy 3 máy ảo, hoặc 2 máy ảo rồi đăng xuất / đăng nhập để đổi tài khoản. Cách tạo nhiều máy ảo xem trong [README của TH04](../TH04/README.md#3-chạy-trên-2-máy-ảo). Package Android của bài này là `com.th05`, nên cài song song với TH04 được.

Kiểm tra code: `npm test`, `npm run lint`, `npx tsc --noEmit`.

## 5. Checklist chức năng

### Phần A - Bắt buộc

#### 1. Trạng thái trong cuộc trò chuyện

- [x] Người kia đang gõ thì tiêu đề hiện "đang soạn tin…". Trong nhóm hiện "A, B đang soạn tin…". Code: `setTyping`/`subscribeTyping` trong [chatService.ts](src/services/chatService.ts).
- [x] Trạng thái đang gõ tự tắt sau 3 giây không gõ, khi gửi tin (`typing/{convId}/{uid}: null` nằm trong cùng lệnh update gửi tin), khi xóa hết chữ, khi rời màn hình hoặc khi app xuống nền.
- [x] Tin cuối của mình hiện "Đã gửi" hoặc "Đã xem HH:mm", cập nhật realtime theo `readStatus/{convId}/{uid}`. Trong nhóm hiện "Đã xem bởi A, B" hoặc "Đã xem bởi tất cả".
- [x] Người kia offline thì tiêu đề hiện "Hoạt động X phút/giờ/ngày trước" và tự cập nhật mỗi 30 giây. Danh bạ cũng hiện như vậy.
- [x] Dùng `onDisconnect()` cho `typing/{convId}/{uid}` (tự xóa) và `users/{uid}` (`online: false`, `lastSeen`, `activeConv: null`).

#### 2. Thu hồi và tương tác

- [x] Nhấn giữ tin để mở menu: 5 cảm xúc 👍 ❤️ 😂 😮 😢, Trả lời, Sao chép (tin chữ), Thu hồi (chỉ tin của mình).
- [x] Thu hồi chỉ đánh dấu `recalled: true` và xóa nội dung, không xóa node. Mọi máy đều hiện "Tin nhắn đã được thu hồi".
- [x] Nếu tin bị thu hồi là tin cuối (`lastMessageId`), `lastMessage` ở Home của mọi thành viên được cập nhật trong cùng lệnh update.
- [x] Cảm xúc hiện dưới bong bóng, gom theo loại, kèm số lượng (ví dụ "❤️ 2"). Nhấn lại cảm xúc đang chọn thì bỏ cảm xúc.

#### 3. Gửi ảnh

- [x] Nút 📷 cho chọn **Chụp ảnh** hoặc **Chọn từ thư viện**. App xin quyền `CAMERA`; nếu bị từ chối thì hiện thông báo.
- [x] Ảnh được thu nhỏ bằng `maxWidth/maxHeight = 1024` (giữ tỉ lệ) trước khi tải lên Cloudinary bằng unsigned preset. Database chỉ lưu `imageUrl`.
- [x] Trong lúc tải lên, app hiện bong bóng tạm có vòng loading. Nếu lỗi thì hiện nút **Thử lại** và **Hủy**.
- [x] Nhấn vào ảnh để xem toàn màn hình ([ImageViewer.tsx](src/components/ImageViewer.tsx)).
- [x] Ở Home, tin cuối là ảnh thì hiện "📷 Hình ảnh", là vị trí thì hiện "📍 Vị trí".

#### 4. Chat nhóm

- [x] Màn hình **Tạo nhóm** (nút 👥 ở Home) có ô tên nhóm và danh sách Danh bạ có checkbox. Phải chọn tối thiểu 2 người ngoài bản thân thì mới tạo được.
- [x] Trong nhóm, tin của người khác hiện tên người gửi phía trên bong bóng. Tiêu đề hiện tên nhóm, số thành viên và số người đang online.
- [x] Home hiện cả chat 1-1 và nhóm, sắp xếp theo `updatedAt` mới nhất. Mỗi thành viên có `unread` riêng trong `userChats/{uid}/{convId}`.
- [x] Nhóm gửi được tin chữ, tin vị trí và tin ảnh, dùng chung code với chat 1-1.

#### 5. Thông báo dùng dữ liệu thật

- [x] Ghi vào `notifications/{uid}` khi có tin mới mà người nhận không mở cuộc trò chuyện đó (dựa vào `users/{uid}/activeConv` và `online`), khi được thêm vào nhóm và khi có người thả cảm xúc vào tin của mình.
- [x] Tab Thông báo có badge số thông báo chưa đọc. Nhấn vào thông báo thì mở đúng cuộc trò chuyện và đánh dấu đã đọc.
- [x] Có nút "Đánh dấu tất cả đã đọc" (một lệnh update nhiều đường dẫn).

### Phần B - Yêu cầu kỹ thuật

- [x] Tin nhắn, `lastMessage` và `unread` của mọi thành viên (kèm thông báo và việc tắt trạng thái đang gõ) được ghi trong **một** `update()` nhiều đường dẫn: `buildMessageUpdates` trong [chatService.ts](src/services/chatService.ts). Số chưa đọc tăng bằng `increment(1)`. Có unit test ở [`__tests__/chatService.test.ts`](__tests__/chatService.test.ts).
- [x] Luật bảo mật nằm trong [database.rules.json](database.rules.json), giải thích chi tiết ở [BAO_CAO_BAO_MAT.md](BAO_CAO_BAO_MAT.md):
  - chỉ thành viên mới đọc và ghi được tin nhắn của cuộc trò chuyện;
  - chỉ người gửi mới thu hồi được tin của mình;
  - mỗi người chỉ ghi được trạng thái đang gõ và cảm xúc của chính mình.
- [x] Tin nhắn tải theo trang. Lần đầu lấy `limitToLast(20)`. Kéo lên đầu danh sách thì tải thêm 20 tin bằng `endBefore(anchor) + limitToLast(20)`. Danh sách dùng `FlatList inverted` nên thêm tin cũ không làm danh sách bị nhảy.
- [x] Code Firebase và Cloudinary nằm trong `src/services/`: `chatService.ts`, `groupService.ts`, `uploadService.ts`, `notificationService.ts`, `userService.ts`, `authService.ts`, `locationService.ts`.
- [x] Mọi listener (`onValue`, `onChildAdded`, `AppState`, notifee, timer) đều được hủy trong cleanup của `useEffect`.
- [x] Không có API secret của Cloudinary trong mã nguồn, chỉ dùng unsigned preset.

### Phần C - Nâng cao

- [x] **Quản trị nhóm** (nhấn vào tiêu đề nhóm): đổi tên nhóm, thêm thành viên, xóa thành viên (chỉ trưởng nhóm), rời nhóm. Mỗi thao tác tạo tin hệ thống, ví dụ "A đã rời nhóm".
- [x] **Trả lời tin** (reply/quote): nhấn vào phần trích dẫn thì cuộn tới tin gốc và tô sáng nó. Nếu tin gốc chưa được tải, app tự tải thêm các trang cũ hơn.
- [x] **Hồ sơ cá nhân** (Cài đặt > Hồ sơ cá nhân): đổi họ tên và ảnh đại diện (tải lên Cloudinary). Ảnh mới cập nhật ở Danh bạ, Home và Chat.
- [x] **Thông báo cục bộ** bằng `@notifee/react-native` khi app chạy nền. Nhấn vào thông báo thì mở đúng cuộc trò chuyện.
- [x] **Tìm kiếm** nội dung tin nhắn trong một cuộc trò chuyện (biểu tượng 🔍 trên tiêu đề). Nhấn vào kết quả thì cuộn tới tin đó.

## 6. Cấu trúc dữ liệu

```text
users/{uid}                  name, email, online, lastSeen, avatarUrl?, activeConv?
conversations/{convId}       type: "direct" | "group", name?, members: {uid: true}, createdBy, createdAt
messages/{convId}/{msgId}    senderId, type: "text" | "image" | "location" | "system",
                             text?, imageUrl?, lat?, lng?, createdAt, recalled?,
                             reactions?: {uid: "❤️"}, replyTo?: {id, senderId, preview}
userChats/{uid}/{convId}     type, peerId? (1-1), name? (nhóm), lastMessage, lastMessageId,
                             lastType, lastSenderId, updatedAt, unread
readStatus/{convId}/{uid}    thời điểm đọc cuối (ms)
typing/{convId}/{uid}        true
notifications/{uid}/{id}     type: "message" | "group" | "reaction", convId, fromUid, text, createdAt, read
```

- Chat 1-1 dùng `convId = uidNhỏ_uidLớn`, giống TH04, nên đọc lại được tin nhắn cũ.
- Nhóm dùng `convId` là khóa `push()`.
- `userChats` lưu thêm `type`, `peerId` hoặc `name`, để màn hình Home không phải đọc từng `conversations/{convId}`.

## 7. Cấu trúc mã nguồn

| Thư mục / file | Nội dung |
| --- | --- |
| `src/services/chatService.ts` | Cuộc trò chuyện, tải tin theo trang, gửi tin (multi-path), thu hồi, cảm xúc, đã xem, đang gõ, tìm kiếm |
| `src/services/groupService.ts` | Tạo nhóm, đổi tên, thêm / xóa thành viên, rời nhóm |
| `src/services/uploadService.ts` | Xin quyền camera, chọn / chụp ảnh, tải ảnh lên Cloudinary |
| `src/services/notificationService.ts` | Thông báo trong DB, đánh dấu đã đọc, thông báo cục bộ (notifee) |
| `src/services/userService.ts` | Danh sách người dùng, online / offline, cuộc trò chuyện đang mở, hồ sơ |
| `src/screens/ChatDetailScreen.tsx` | Màn hình chat (1-1 và nhóm) |
| `src/screens/CreateGroupScreen.tsx`, `GroupInfoScreen.tsx` | Tạo nhóm, quản trị nhóm |
| `src/screens/NotificationsScreen.tsx` | Thông báo |
| `src/screens/EditProfileScreen.tsx` | Hồ sơ cá nhân |
| `src/components/MessageItem.tsx`, `MessageMenu.tsx`, `ImageViewer.tsx`, `MemberPicker.tsx` | Bong bóng tin, menu nhấn giữ, xem ảnh, chọn thành viên |

## 8. Kịch bản kiểm tra nhanh

| Bước | Thao tác | Kết quả mong đợi |
| --- | --- | --- |
| 1 | A, B, C đăng ký. A mở chat với B rồi gõ chữ | B thấy "đang soạn tin…". A ngừng gõ 3 giây thì trạng thái mất |
| 2 | A gửi tin, B đang ở Home | B thấy số chưa đọc tăng, badge Thông báo tăng. Tin cuối của A hiện "Đã gửi" |
| 3 | B mở cuộc trò chuyện | Tin của A chuyển thành "Đã xem HH:mm", số chưa đọc của B về 0 |
| 4 | B tắt app (vuốt khỏi đa nhiệm) | Tiêu đề bên A chuyển thành "Hoạt động vừa xong", rồi "Hoạt động X phút trước" |
| 5 | A nhấn giữ tin cuối và chọn Thu hồi | Hai máy đều hiện "Tin nhắn đã được thu hồi". Home của B cũng đổi dòng tin cuối |
| 6 | B nhấn giữ tin của A và thả ❤️ | Bong bóng hiện ❤️. A nhận thông báo "đã thả ❤️ vào tin nhắn" |
| 7 | A nhấn 📷 > Chụp ảnh và từ chối quyền | Hiện "Không có quyền camera" |
| 8 | A chọn ảnh từ thư viện | Hiện bong bóng tạm có loading, sau đó B thấy ảnh. Home hiện "📷 Hình ảnh" |
| 9 | A tạo nhóm với B và C | B, C có thông báo "đã thêm bạn vào nhóm". Home của B, C hiện nhóm |
| 10 | B, C nhắn trong nhóm | Tin hiện ngay ở mọi máy, có tên người gửi. Số chưa đọc của từng người tính riêng |
| 11 | C vào Thông tin nhóm > Rời nhóm | Nhóm hiện tin hệ thống "C đã rời nhóm" |
