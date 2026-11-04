# TH04 - ChatMate (Firebase Realtime)

Ứng dụng chat 1-1 viết bằng React Native CLI, phát triển tiếp từ TH03. Dữ liệu mẫu đã được thay bằng Firebase Authentication và Realtime Database. Màn hình Thông báo vẫn dùng dữ liệu mẫu như bài trước.

## 1. Cài đặt

Cần Node.js 22.11 trở lên, Android Studio (có Android SDK) và JDK 17-21.

```sh
cd TH04
npm install
```

## 2. Tạo project Firebase

Chỉ cần làm một lần.

1. Vào <https://console.firebase.google.com>, chọn **Create a project**.
2. **Build > Authentication > Get started**, tab **Sign-in method**, bật **Email/Password**.
3. **Build > Realtime Database > Create Database**, chọn vùng (ví dụ Singapore), chọn **Start in locked mode**.
4. Tab **Rules** của Realtime Database: dán nội dung file [database.rules.json](database.rules.json) rồi bấm **Publish**.
5. **Project settings** (biểu tượng bánh răng) **> Your apps**, chọn biểu tượng Web `</>`, đặt tên rồi **Register app**. Không cần bật Hosting.
6. Sao chép các giá trị trong `firebaseConfig` vào [src/services/firebaseConfig.ts](src/services/firebaseConfig.ts). Nếu trong đoạn cấu hình không có `databaseURL`, lấy URL ở đầu trang Realtime Database, tab **Data**.

## 3. Chạy trên 2 máy ảo

### Tạo máy ảo thứ hai (làm một lần)

Mở Android Studio, vào **Device Manager**, chọn **Create Virtual Device** và tạo thêm một máy nữa. Ví dụ có hai máy tên `Pixel_9` và `Pixel_9_2`. Mỗi máy nên có RAM 2 GB.

Nếu không đủ dung lượng ổ cứng, có thể chạy hai bản của cùng một máy bằng cách thêm `-read-only` vào cả hai lệnh ở bước dưới. Khi đó dữ liệu trên máy ảo sẽ mất sau khi tắt.

### Khởi động và cài app

Mở **bốn cửa sổ terminal**.

**Terminal 1 - máy ảo A:**

```sh
emulator -avd Pixel_9 -port 5554
```

**Terminal 2 - máy ảo B:**

```sh
emulator -avd Pixel_9_2 -port 5556
```

Nếu không nhận lệnh `emulator`, hãy chạy nó trong thư mục `%LOCALAPPDATA%\Android\Sdk\emulator`.

**Terminal 3 - Metro.** Đợi cả hai máy khởi động xong, rồi kiểm tra:

```sh
adb devices
```

Kết quả phải có `emulator-5554` và `emulator-5556` cùng trạng thái `device`. Sau đó:

```sh
cd TH04
npm start
```

**Terminal 4 - build.** Mở thêm một terminal và chạy:

```sh
cd TH04
npx react-native run-android
```

Khi có nhiều máy đang chạy, lệnh này cài và mở app trên tất cả các máy. Metro (`npm start`) chỉ cần chạy một lần và dùng chung cho cả hai.

Nếu chỉ một máy mở được app:

```sh
adb -s emulator-5556 shell am start -n com.th04/.MainActivity
```

Nếu máy báo không kết nối được Metro (màn hình đỏ `Unable to load script`):

```sh
adb -s emulator-5554 reverse tcp:8081 tcp:8081
adb -s emulator-5556 reverse tcp:8081 tcp:8081
```

rồi nhấn `R` hai lần trên máy ảo để tải lại.

## 4. Kịch bản kiểm tra

| Bước | Máy A | Máy B | Kết quả mong đợi |
| --- | --- | --- | --- |
| 1 | Đăng ký `a@test.com` | Đăng ký `b@test.com` | Cả hai vào được màn hình Chat |
| 2 | Mở Danh bạ | | Thấy B đang online, không thấy chính mình |
| 3 | | Đăng xuất ở Cài đặt | B về màn hình Đăng nhập; Danh bạ của A chuyển B thành Ngoại tuyến |
| 4 | | Đăng nhập sai mật khẩu | Hiện "Email hoặc mật khẩu không đúng" |
| 5 | | Đăng nhập đúng | A thấy B online trở lại |
| 6 | Nhấn vào B, gửi tin | Ở tab Chat | B thấy tin mới, số chưa đọc tăng ngay |
| 7 | | Mở cuộc trò chuyện với A | Số chưa đọc về 0; tin của A bên trái, tin của B bên phải |
| 8 | Nhấn nút 📍, chọn **Don't allow** | | Hiện thông báo không có quyền vị trí |
| 9 | Nhấn 📍, chọn **While using the app** | | B thấy tin vị trí khác màu, nhấn vào mở Google Maps đúng tọa độ |

### Đặt vị trí giả cho máy ảo

Máy ảo không có GPS thật. Trên thanh công cụ máy ảo, chọn **... (Extended controls) > Location**, chọn một điểm và bấm **Set Location**. Có thể dùng lệnh:

```sh
adb -s emulator-5554 emu geo fix 105.8542 21.0285
```

Lưu ý thứ tự: **kinh độ trước, vĩ độ sau**.

Muốn thử lại bước từ chối quyền thì thu hồi quyền bằng:

```sh
adb -s emulator-5554 shell pm revoke com.th04 android.permission.ACCESS_FINE_LOCATION
adb -s emulator-5554 shell pm revoke com.th04 android.permission.ACCESS_COARSE_LOCATION
```

## 5. Cấu trúc dữ liệu

```text
users/{uid}                 name, email, online, lastSeen
messages/{chatId}/{id}      senderId, type (text | location), text | latitude + longitude, createdAt
userChats/{uid}/{otherUid}  lastMessage, lastSenderId, lastTime, unreadCount
```

`chatId` là hai uid sắp xếp theo thứ tự rồi nối bằng dấu `_`, nên hai người luôn dùng chung một cuộc trò chuyện.

Toàn bộ code Firebase nằm trong [src/services/](src/services):

| File | Nội dung |
| --- | --- |
| `firebase.ts`, `firebaseConfig.ts` | Khởi tạo Firebase |
| `authService.ts` | Đăng ký, đăng nhập, đăng xuất, thông báo lỗi |
| `userService.ts` | Danh sách người dùng, trạng thái online/offline |
| `chatService.ts` | Gửi và nhận tin nhắn, cuộc trò chuyện, số chưa đọc |
| `locationService.ts` | Xin quyền, lấy vị trí, mở Google Maps |

## 6. Lỗi thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| "Chưa cấu hình Firebase" | Chưa điền `src/services/firebaseConfig.ts` (mục 2, bước 6) |
| "Chưa bật đăng nhập Email/Password" | Chưa bật nhà cung cấp này (mục 2, bước 2) |
| "Không tải được dữ liệu" | Chưa Publish luật bảo mật, hoặc sai `databaseURL` |
| "Không gửi được vị trí" trên máy ảo | Chưa đặt vị trí giả (mục 4) |
| Build báo lỗi phiên bản Java | Đặt `JAVA_HOME` về JDK của Android Studio (`...\Android Studio\jbr`) |

Kiểm tra code: `npm test`, `npm run lint`, `npx tsc --noEmit`.
