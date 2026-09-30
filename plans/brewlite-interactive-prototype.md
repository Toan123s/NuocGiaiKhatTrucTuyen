# Kế hoạch xây dựng prototype BrewLite tương tác

## 1. Mục tiêu và phạm vi

Xây dựng một single-page app BrewLite bằng React 19 + Vite + Tailwind CSS v4 trong repo hiện tại, mô phỏng đầy đủ luồng người dùng cốt lõi trong PDF:

1. Xem menu đồ uống.
2. Lọc/tìm sản phẩm.
3. Mở chi tiết, chọn size và topping.
4. Thêm vào giỏ, sửa số lượng, xóa món.
5. Đăng nhập mô phỏng tại thời điểm cần thanh toán.
6. Chọn phương thức Ví điện tử hoặc Thẻ ngân hàng và thanh toán mô phỏng.
7. Xem xác nhận đơn và lịch sử đơn.

Đây là prototype frontend có tương tác, không triển khai NestJS/PostgreSQL/JWT/payment gateway thật. Dữ liệu sản phẩm là dữ liệu mẫu; giỏ hàng, phiên đăng nhập và đơn hàng được lưu ở `localStorage` để vẫn còn sau khi tải lại trang.

## 2. Tiêu chí hoàn thành

- Luồng end-to-end chạy được: menu → cấu hình món → giỏ hàng → đăng nhập mô phỏng → thanh toán → xác nhận → lịch sử đơn.
- Mọi tổng tiền cập nhật đúng theo size, topping, số lượng và phí dịch vụ.
- Badge giỏ hàng, trạng thái rỗng, trạng thái thanh toán và thông báo phản hồi hoạt động rõ ràng.
- Giao diện tiếng Việt, responsive tốt ở mobile và desktop.
- Reload trang không làm mất giỏ hàng hoặc lịch sử đơn.
- Không phá entrypoint, cấu hình Vite/Tailwind và cấu trúc nền hiện có.

## 3. Định hướng giao diện

### Ngôn ngữ thị giác

- Phong cách quán cà phê hiện đại, ấm và tối giản: nền kem nhạt, nâu espresso, xanh olive làm màu nhấn, điểm cam caramel cho CTA/trạng thái.
- Typography rõ cấp bậc; tận dụng font hệ thống hiện tại để không phát sinh font dependency.
- Card sản phẩm bo góc lớn, ảnh đồ uống nổi bật, shadow nhẹ và khoảng trắng rộng.
- Dùng ảnh cà phê từ kết quả Unsplash đã tìm kiếm, cắt ảnh bằng `object-cover`, kèm alt text đúng nội dung; có gradient/placeholder nền để giao diện vẫn ổn nếu ảnh tải chậm.
- Icon được vẽ bằng SVG nội tuyến nhất quán, không dùng emoji và không thêm icon package chỉ cho vài biểu tượng.
- Chuyển cảnh nhẹ cho drawer/modal, hover card và trạng thái nút; tôn trọng `prefers-reduced-motion`.

### Bố cục

- Header cố định nhẹ: logo BrewLite, liên kết Menu/Lịch sử, trạng thái người dùng và nút giỏ có badge.
- Hero gọn với thông điệp “Đặt trước, nhận nhanh”, CTA cuộn đến menu và khối thông tin giao/nhận tại quầy.
- Khu menu gồm tìm kiếm, chip danh mục và grid sản phẩm.
- Desktop: giỏ hàng dạng panel bên phải; mobile: bottom sheet/toàn màn hình.
- Chi tiết món hiển thị trong modal/sheet với ảnh, mô tả, size, topping, số lượng và giá cập nhật trực tiếp.
- Checkout là view tập trung, ít nhiễu; confirmation dùng mã đơn lớn và timeline trạng thái.

## 4. Kiến trúc mã nguồn dự kiến

Giữ `src/main.tsx` làm entrypoint và mở rộng ứng dụng theo các phần sau:

- `src/App.tsx`: application shell, điều phối view hiện tại và kết nối các state chính.
- `src/data/products.ts`: kiểu dữ liệu và danh sách sản phẩm mẫu (cà phê, trà, đá xay), giá cơ bản, mô tả, ảnh, badge và khả năng tùy chọn.
- `src/types.ts`: `Product`, `CartItem`, `SizeOption`, `Topping`, `PaymentMethod`, `Order`, `OrderStatus`, `UserSession`.
- `src/hooks/usePersistentState.ts`: wrapper đồng bộ state với `localStorage`, parse an toàn và fallback khi dữ liệu hỏng/không khả dụng.
- `src/components/`:
  - `Header`
  - `Hero`
  - `MenuSection`
  - `ProductCard`
  - `ProductCustomizer`
  - `CartDrawer`
  - `AuthDialog`
  - `CheckoutView`
  - `OrderConfirmation`
  - `OrderHistory`
  - các primitive nhỏ dùng lại như `Button`, `IconButton`, `QuantityControl`, `EmptyState`, `StatusPill` nếu việc tách giúp giảm lặp.
- `src/index.css`: Tailwind import ở đầu, sau đó theme variables, base typography, scrollbar tinh gọn và animation dùng chung. Không thêm universal reset không phân lớp.

Không thêm router dependency: prototype có số màn hình hữu hạn nên dùng state `activeView` (`menu | checkout | confirmation | history`) và dialog/drawer state. Điều này giữ thay đổi nhỏ, tránh phụ thuộc không cần thiết và vẫn hỗ trợ đầy đủ flow demo.

## 5. Mô hình dữ liệu và tính giá

### Sản phẩm

Mỗi sản phẩm gồm:

- `id`, `name`, `category`, `description`, `imageUrl`, `basePrice`
- `popular` hoặc badge tùy chọn
- danh sách size với phần tăng giá, ví dụ S `+0`, M `+5.000đ`, L `+10.000đ`
- topping dùng chung với giá riêng, ví dụ shot espresso, kem sữa, trân châu cà phê

Dữ liệu ban đầu khoảng 8 sản phẩm để grid phong phú nhưng vẫn gọn: cà phê sữa, americano, cappuccino, bạc xỉu, cold brew, trà đào, matcha latte và chocolate đá xay.

### Item trong giỏ

Một dòng giỏ được định danh bằng khóa kết hợp `productId + size + toppingIds`; thêm cùng cấu hình sẽ tăng số lượng thay vì tạo dòng trùng. `unitPrice = basePrice + sizeDelta + tổng topping`, `lineTotal = unitPrice × quantity`.

### Tổng thanh toán

- `subtotal`: tổng các dòng.
- `serviceFee`: phí dịch vụ cố định nhỏ hoặc miễn phí theo ngưỡng; quy tắc hiển thị minh bạch trong summary.
- `total`: subtotal + serviceFee.
- Dùng số nguyên VND và formatter `vi-VN`, không dùng số thực.

## 6. Luồng tương tác chi tiết

### Menu và chi tiết món

- Tìm theo tên/mô tả không phân biệt hoa thường.
- Lọc theo “Tất cả”, “Cà phê”, “Trà”, “Đá xay”.
- Empty state có nút xóa bộ lọc.
- Click card mở customizer; size mặc định là M, topping mặc định rỗng, quantity là 1.
- Nút thêm vào giỏ hiển thị giá hiện tại; sau khi thêm, đóng modal và hiện toast ngắn.

### Giỏ hàng

- Tăng/giảm số lượng; giảm từ 1 sẽ không âm và nút xóa riêng xử lý việc loại món.
- Hiển thị cấu hình size/topping của từng dòng.
- Giỏ rỗng có CTA quay về menu.
- Nút “Tiến hành thanh toán” bị vô hiệu khi rỗng.

### Đăng nhập mô phỏng

- Khi checkout mà chưa có session, mở dialog đăng nhập.
- Form gồm email và mật khẩu; validate email cơ bản và mật khẩu tối thiểu 6 ký tự.
- Bất kỳ thông tin hợp lệ nào cũng tạo session demo; không lưu mật khẩu.
- Sau đăng nhập, tiếp tục checkout ngay, không làm mất giỏ.

### Checkout và payment mock

- Tóm tắt đơn, điểm nhận tại quầy, hai phương thức “Ví điện tử” và “Thẻ ngân hàng”.
- Checkbox xác nhận thông tin; nút thanh toán chỉ bật khi có phương thức hợp lệ.
- Khi submit: hiển thị loading ngắn, khóa double submit, tạo mã đơn dạng `BL-xxxxxx`, lưu order với trạng thái `PAID`, xóa giỏ và chuyển sang confirmation.
- Prototype mặc định dùng happy path ổn định để demo. Không giả lập lỗi ngẫu nhiên vì khó kiểm thử; có thể cung cấp nút dev/demo rõ nhãn nếu cần chứng minh failure state, nhưng không đưa vào flow chính.

### Xác nhận và lịch sử

- Confirmation hiển thị mã đơn, tổng tiền, phương thức, thời gian dự kiến và timeline `Đã thanh toán → Đang chuẩn bị → Sẵn sàng nhận` với bước đầu active.
- CTA “Tiếp tục đặt món” về menu và “Xem lịch sử đơn”.
- Lịch sử sắp xếp mới nhất trước, có trạng thái, số món, tổng tiền và ngày giờ; empty state nếu chưa có đơn.

## 7. State, persistence và khả năng chịu lỗi

- State chính: `cart`, `orders`, `session`, `activeView`, `selectedProduct`, `isCartOpen`, `toast`.
- Các key `localStorage` có prefix `brewlite:` để tránh xung đột.
- Hook persistence bọc `try/catch`; nếu JSON hỏng thì dùng initial state thay vì làm crash app.
- Khi sản phẩm tham chiếu trong cart không còn trong catalog, bỏ qua item không hợp lệ khi hydrate hoặc render fallback an toàn.
- Modal/drawer đóng bằng nút close và Escape; khóa scroll nền khi mở; focus vào heading/control đầu tiên nếu triển khai không làm tăng đáng kể độ phức tạp.

## 8. Responsive và accessibility

- Mobile-first, các breakpoint chính ở khoảng tablet và desktop.
- Touch target tối thiểu khoảng 44px cho nút số lượng, close và navigation.
- Semantic HTML: `header`, `nav`, `main`, `section`, `button`, `form`; label rõ ràng cho input/radio/checkbox.
- Modal có `role="dialog"`, `aria-modal`, tên truy cập; icon-only button có `aria-label`.
- Màu chữ/nút bảo đảm tương phản; focus ring nhìn thấy bằng bàn phím.
- Ảnh có alt text mô tả món; ảnh trang trí dùng alt rỗng khi thích hợp.

## 9. Trình tự triển khai

1. Khai báo type, dữ liệu menu và utility định dạng tiền/tạo key giỏ.
2. Tạo persistent state hook và application state trong `App.tsx`.
3. Xây application shell, header, hero và menu responsive.
4. Thêm product customizer và logic giá/cấu hình món.
5. Thêm cart drawer cùng update/remove/summary.
6. Thêm auth dialog và validation mô phỏng.
7. Thêm checkout, payment state, tạo đơn và confirmation.
8. Thêm order history và navigation giữa các view.
9. Hoàn thiện CSS theme, animation, keyboard/focus behavior và trạng thái rỗng/lỗi.
10. Kiểm tra toàn bộ flow trên kích thước mobile/desktop trong preview và sửa lỗi giao diện quan sát được.

## 10. Chiến lược xác minh

Theo hướng dẫn repo, preview là tín hiệu xác minh chính:

- Kiểm thử thủ công trên preview ở desktop và mobile.
- Kiểm tra các kịch bản:
  1. tìm/lọc menu;
  2. thêm hai cấu hình khác nhau của cùng món;
  3. tăng/giảm/xóa item;
  4. refresh và xác nhận giỏ vẫn còn;
  5. validation đăng nhập;
  6. thanh toán không thể double-submit;
  7. giỏ bị xóa sau khi thanh toán;
  8. confirmation và history hiển thị đơn mới;
  9. refresh và xác nhận session/history vẫn còn;
  10. keyboard focus, Escape để đóng dialog/sheet và reduced motion.
- Vì đây là thay đổi UI rộng, chạy `pnpm build` một lần sau khi preview ổn để bắt lỗi TypeScript/JSX/bundling.
- Không thêm test framework mới chỉ cho prototype; logic được giữ nhỏ, thuần và xác minh qua flow thực tế.

## 11. Ngoài phạm vi

- NestJS, Next.js, PostgreSQL, Prisma/TypeORM, Docker Compose.
- Đăng ký/JWT/bcrypt thật.
- Payment gateway thật, idempotency server-side, tồn kho đồng thời.
- Barista dashboard và chuyển trạng thái đơn theo thời gian thực.
- Voucher/loyalty backend thật.
- Upload ảnh hoặc CMS quản trị menu.

Các phần này có thể là giai đoạn 2 nếu prototype được duyệt và cần tiến tới đúng kiến trúc full-stack trong PDF.
