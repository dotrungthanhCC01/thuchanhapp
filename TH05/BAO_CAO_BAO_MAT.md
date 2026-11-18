# Báo cáo: Luật bảo mật Realtime Database (TH05)

Toàn bộ luật nằm trong file [database.rules.json](database.rules.json). Có ba nguyên tắc chính:

1. Mọi thao tác đều cần `auth != null`.
2. Quyền truy cập dựa vào `conversations/{convId}/members/{auth.uid}`.
3. Với lệnh `update()` nhiều đường dẫn, `root` là dữ liệu **trước** khi ghi, còn `newData.parent()...` là dữ liệu **sau** khi ghi. Khi tạo nhóm, tin nhắn đầu tiên, `userChats` và thông báo được ghi cùng lúc với node `conversations`. Vì vậy luật kiểm tra tư cách thành viên ở cả hai trạng thái (`root` hoặc `newData`).

## 1. Chỉ thành viên mới đọc và ghi được tin nhắn

```json
"messages": { "$convId": {
  ".read": "auth != null && root.child('conversations').child($convId).child('members').child(auth.uid).exists()",
  "$msgId": {
    ".write": "auth != null && !data.exists() && newData.child('senderId').val() === auth.uid && (<là thành viên trước> || <là thành viên sau>)"
```

- Người không có trong `members` không đọc được `messages/{convId}`, kể cả khi đoán được `convId`.
- Tin chỉ được **tạo mới** (`!data.exists()`), với `senderId` phải là chính mình. Vì vậy không ai ghi đè hoặc xóa được tin, kể cả người gửi.
- `.validate` bắt buộc có `senderId`, `type`, `createdAt`. Nội dung phải khớp loại tin (`text` / `image` / `location` / `system`). `createdAt <= now`, và các trường lạ bị chặn bằng `$other: false`.
- `readStatus` và `typing` cũng chỉ thành viên mới đọc được.
- `conversations/{convId}` chỉ thành viên (hoặc hai người có uid nằm trong id chat 1-1) mới đọc được. Thành viên chỉ được tự thêm vào nhóm nếu đã là thành viên. Chỉ trưởng nhóm (`createdBy`) xóa được người khác, còn ai cũng tự rời nhóm được.

## 2. Chỉ người gửi mới thu hồi được tin của mình

```json
"recalled": {
  ".write": "auth != null && data.parent().child('senderId').val() === auth.uid && newData.val() === true && <là thành viên>",
  ".validate": "newData.val() === true"
},
"text": {
  ".write": "auth != null && data.parent().child('senderId').val() === auth.uid && !newData.exists() && newData.parent().child('recalled').val() === true"
}
```

- Chỉ người có `auth.uid` bằng `senderId` của tin mới đặt được `recalled = true`.
- Không thể "bỏ thu hồi", vì giá trị bắt buộc là `true`.
- Nội dung (`text`, `imageUrl`, `lat`, `lng`) chỉ được **xóa**, và chỉ khi tin cũng được đánh dấu `recalled` trong cùng lần ghi. Như vậy không ai sửa được nội dung tin đã gửi.

## 3. Mỗi người chỉ ghi trạng thái đang gõ và cảm xúc của chính mình

```json
"typing":    { "$convId": { "$uid": { ".write": "auth != null && $uid === auth.uid && (<là thành viên> || !newData.exists())" } } },
"reactions": { "$uid": { ".write": "auth != null && $uid === auth.uid && data.parent().parent().exists() && <là thành viên>" } }
```

- Khóa `$uid` phải trùng `auth.uid`, nên A không bật được "đang soạn tin" của B hay thả cảm xúc thay B.
- Cảm xúc chỉ ghi được vào tin đã tồn tại và phải là chuỗi ngắn (≤ 16 ký tự).

## 4. Các nhánh khác

| Nhánh | Luật |
| --- | --- |
| `users/{uid}` | Ai đăng nhập cũng đọc được. Chỉ chủ tài khoản ghi được. Chỉ cho phép các trường `name`, `email`, `online`, `lastSeen`, `avatarUrl` (https), `activeConv` |
| `userChats/{uid}/{convId}` | Chỉ chủ tài khoản đọc được. Thành viên của cuộc trò chuyện được ghi tóm tắt cho thành viên khác (để gửi tin bằng một lệnh update), nhưng người nhận cũng phải là thành viên. `unread` phải là số ≥ 0 |
| `readStatus/{convId}/{uid}` | Chỉ ghi được của chính mình, giá trị là số `<= now` |
| `notifications/{uid}/{id}` | Chỉ chủ tài khoản đọc, đánh dấu đã đọc hoặc xóa được. Người khác chỉ được **tạo mới**, với điều kiện `fromUid` là chính mình và cả hai đều là thành viên của `convId` trong thông báo. Nhờ vậy người lạ không spam thông báo được |

## 5. Chứng minh bằng thao tác bị từ chối (Rules Playground & Thực nghiệm App)

### A. Thực nghiệm thực tế trên ứng dụng (File ảnh `permission_denied.png`):
- **Tình huống**: Tài khoản `thongdt` (UID khác) cố tình gửi lệnh ghi trực tiếp để thu hồi tin nhắn `-P6hxFti02-BM10WbAIB` do tài khoản `thanhdt` (UID `WXvh37x40Ze363JmjPdtWU0Na2s2`) gửi.
- **Đường dẫn ghi**: `/messages/-P6hqw1pcRkm0yT-eRcO/-P6hxFti02-BM10WbAIB/recalled = true`
- **Kết quả trả về từ Firebase Server**:
  ```
  Lỗi bảo mật (PERMISSION_DENIED)
  Thao tác bị từ chối bởi Firebase Security Rules:
  PERMISSION_DENIED: Permission denied
  (Code: PERMISSION_DENIED)
  ```
- **Ảnh chụp màn hình thực tế**: Đã chụp và lưu trực tiếp tại file `permission_denied.png` trong thư mục dự án TH05.

### B. Kiểm chứng qua Rules Playground trên Firebase Console:

Vào Firebase Console, mở **Realtime Database > Rules > Rules Playground**, bật **Authenticated** và nhập **UID** như các ví dụ dưới, rồi bấm **Run**.

| # | Loại | Vị trí | UID | Dữ liệu | Kết quả mong đợi |
| --- | --- | --- | --- | --- | --- |
| 1 | read | `/messages/<id-nhóm>` | uid **không** thuộc nhóm | | ❌ Denied |
| 2 | update | `/messages/<id-nhóm>/<id-tin-của-A>` | uid của **B** | `{"recalled": true}` | ❌ Denied (B không phải người gửi) |
| 3 | set | `/typing/<id-nhóm>/<uid-A>` | uid của **B** | `true` | ❌ Denied (B ghi thay A) |
| 4 | set | `/messages/<id-nhóm>/<id-tin>/reactions/<uid-A>` | uid của **B** | `"❤️"` | ❌ Denied |
| 5 | update | `/messages/<id-nhóm>/<id-tin-của-A>` | uid của **A** | `{"recalled": true, "text": null}` | ✅ Allowed |

Cách tái hiện lỗi `PERMISSION_DENIED` ngay trong app:

1. Tạo nhóm gồm A, B, C, rồi cho C rời nhóm.
2. C mở lại cuộc trò chuyện đó, ví dụ từ một thông báo cũ trong tab Thông báo.
3. Listener `messages/{convId}` bị từ chối. Metro log hiện `permission_denied at /messages/...` và app báo "Bạn không phải thành viên của cuộc trò chuyện này" rồi quay lại.
