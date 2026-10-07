# Ứng Dụng Dự Báo Thời Tiết (Weather Forecast Mobile App)
> **Môn học / Bài tập:** Xây dựng ứng dụng dự báo thời tiết đa chức năng trên thiết bị di động  
> **Nền tảng:** React Native (TypeScript) • **Nguồn dữ liệu:** Open-Meteo Weather API thực tế (Không sử dụng dữ liệu tĩnh)  
> **Thiết kế UI:** Chuẩn phong cách thiết kế Daily UI #037 với giao diện cong hiện đại, hỗ trợ cả **Dark Mode** & **Light Mode**.

---

## 📸 Hình Ảnh Giao Diện & Tính Năng

- **Màn hình chính (Home):** Ảnh nền thành phố chất lượng cao, đường cong chuyển cảnh (curved wave), nhiệt độ lớn tối giản, biểu tượng trạng thái thời tiết, nhãn cảnh báo (High pollen / Không khí tốt), dự báo 24 giờ tới theo dạng lướt ngang, lưới chỉ số nhanh và bảng dự báo 7 ngày.
- **Hỗ trợ 2 chế độ màu:**
  - 🌙 **Dark Mode:** Tông nền đen than / xanh than bóng đêm sang trọng (như bản thiết kế mẫu bên trái).
  - ☀️ **Light Mode:** Tông trắng tối giản hiện đại (như bản thiết kế mẫu bên phải).
- **Hệ thống điều hướng 4 Tab:**
  1. ☀️ **Thời tiết:** Xem tổng quan thời tiết hiện tại + dự báo 24h + tóm tắt chỉ số.
  2. 📅 **7 Ngày:** Dự báo chi tiết 7 ngày với thanh nhiệt độ trực quan và xác suất mưa.
  3. 📊 **Chỉ số:** Chi tiết 8 chỉ số chuyên sâu (Nhiệt độ, Cảm nhận, Độ ẩm, Gió, UV, Lượng mưa, Áp suất, Tầm nhìn, Bình minh/Hoàng hôn) + Lời khuyên hoạt động thực tế.
  4. 🔍 **Địa điểm:** Quản lý địa điểm, tra cứu thành phố toàn cầu với Geocoding API thực tế, nút lấy vị trí GPS hiện tại và danh sách thành phố nổi tiếng (Tokyo, Hà Nội, TP.HCM, Đà Nẵng, New York, London, Paris, Seoul,...).

---

## 🌟 Đáp Ứng Đầy Đủ Yêu Cầu Đề Bài

### 1. Xem thời tiết hiện tại
- [x] Hiển thị địa điểm hiện tại (Tên thành phố, quận/huyện, quốc gia).
- [x] Hiển thị nhiệt độ hiện tại (font số lớn, tối giản).
- [x] Trạng thái thời tiết thực tế (Trời quang, Mây rải rác, Mưa rào, Giông bão,...) kèm icon sinh động.
- [x] Hiển thị nhiệt độ cao nhất (Max), thấp nhất (Min) và nhiệt độ cảm nhận (Apparent Temperature / Feels like).

### 2. Xem dự báo theo giờ (24 giờ)
- [x] Thanh cuộn ngang hiển thị 24 mốc giờ tiếp theo.
- [x] Mỗi mốc hiển thị: giờ, biểu tượng thời tiết, nhiệt độ, khả năng mưa (%).
- [x] Chạm vào bất kỳ mốc giờ nào để mở popup xem chi tiết đầy đủ.

### 3. Xem dự báo nhiều ngày (7 ngày)
- [x] Danh sách 7 ngày trong tuần kèm ngày/tháng.
- [x] Hiển thị trạng thái, icon thời tiết, thanh nhiệt độ dải Max/Min và xác suất mưa.
- [x] Chạm vào từng ngày để mở popup xem chi tiết và giờ mọc/lặn mặt trời.

### 4. Xem thông tin chi tiết về thời tiết
- [x] Modal popup hiển thị đầy đủ thông số khi bấm vào một mốc giờ hoặc một ngày.
- [x] Lời khuyên thông minh: nhắc mang ô nếu mưa > 50%, kem chống nắng khi UV cao, trang phục giữ ấm khi trời lạnh.

### 5. Theo dõi các chỉ số thời tiết
- [x] **Nhiệt độ & Cảm nhận thực tế** (°C).
- [x] **Độ ẩm không khí** (%).
- [x] **Tốc độ gió & Hướng gió** (km/h, độ và hướng la bàn: Bắc, Đông Bắc, Đông, Nam,...).
- [x] **Chỉ số UV** kèm mức độ phân loại màu sắc (Thấp, Trung bình, Cao, Rất cao, Cực nguy hiểm).
- [x] **Lượng mưa & Xác suất mưa** (mm, %).
- [x] **Áp suất khí quyển** (hPa).
- [x] **Tầm nhìn xa** (km).
- [x] **Thời gian mặt trời mọc & lặn**.

### 6. Sử dụng vị trí thiết bị (GPS)
- [x] Sử dụng `PermissionsAndroid` xin quyền vị trí (`ACCESS_FINE_LOCATION`).
- [x] Lấy tọa độ và gọi API Reverse Geocoding để chuyển đổi tọa độ thành tên thành phố thực tế.
- [x] Xử lý khi người dùng từ chối quyền hoặc GPS chưa bật (hiển thị thông báo thân thiện và tự động dùng vị trí mặc định / cho phép tìm kiếm thủ công).

---

## 🛠️ Cấu Trúc Mã Nguồn (Clean Architecture)

```text
TH02/
├── App.tsx                       # Màn hình chính kết nối toàn bộ hệ thống & Navigation
├── src/
│   ├── types/
│   │   └── weather.ts            # Định nghĩa Interface TypeScript chặt chẽ cho dữ liệu
│   ├── constants/
│   │   ├── cities.ts             # Danh sách thành phố gợi ý & ảnh nền chất lượng cao
│   │   └── theme.ts              # Bảng màu Dark Mode & Light Mode chuẩn thiết kế
│   ├── services/
│   │   ├── weatherApi.ts         # Gọi Open-Meteo Forecast & Geocoding API thực tế
│   │   └── locationService.ts    # Xử lý quyền truy cập vị trí Android & GPS Reverse Geocode
│   └── components/
│       ├── HeaderCard.tsx        # Card giao diện cong, ảnh thành phố, nhiệt độ lớn
│       ├── HourlyForecastList.tsx# Danh sách cuộn ngang dự báo 24 giờ
│       ├── DailyForecastList.tsx # Danh sách dự báo 7 ngày kèm thanh dải nhiệt độ
│       ├── WeatherMetricsGrid.tsx# Lưới hiển thị 8 chỉ số thời tiết chuyên sâu
│       ├── DetailModal.tsx       # Popup chi tiết từng mốc giờ/ngày kèm lời khuyên
│       ├── SearchModal.tsx       # Popup tìm kiếm thành phố với Geocoding API
│       └── NavigationTabBar.tsx  # Thanh điều hướng chuyển đổi 4 tab màn hình
└── android/                      # Mã nguồn ứng dụng Android & cấu hình quyền
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Yêu cầu hệ thống:
- Node.js (>= 18)
- Android Studio với Android SDK và Máy ảo AVD (Emulator) hoặc thiết bị thật đã bật USB Debugging.
- JDK 17.

### Bước 1: Cài đặt thư viện
```bash
npm install
```

### Bước 2: Chạy ứng dụng trên Android
Khởi động máy ảo Android Studio, sau đó chạy lệnh:
```bash
npx react-native run-android
```
Hoặc khởi chạy máy chủ Metro riêng:
```bash
npx react-native start
```

---

## 📱 File APK Cài Đặt Sẵn
File APK debug được tạo tại:
`android/app/build/outputs/apk/debug/app-debug.apk`

Cài đặt trực tiếp vào điện thoại / máy ảo bằng lệnh:
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```
