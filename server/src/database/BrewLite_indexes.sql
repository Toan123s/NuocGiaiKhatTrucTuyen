/* =====================================================================
   BrewLite - Index CHINH THUC (ban rut gon, chi giu index thuc su can)
   Chay SAU brewlite_schema.sql. Thay the toan bo index bo sung truoc do
   (ke ca brewlite_indexes_v2.sql neu da chay). Chay lai nhieu lan an toan.
   Can SQL Server 2016+. Chi thao tac tren index, khong dong vao du lieu.
   ===================================================================== */
USE BrewLite;
GO

/* ---------------------------------------------------------------------
   0. DON DEP: bo cac index cu khong con can (v1 + v2)
   --------------------------------------------------------------------- */
DROP INDEX IF EXISTS IX_Orders_promotion        ON dbo.Orders;
DROP INDEX IF EXISTS IX_OrderItem_product       ON dbo.OrderItem;
DROP INDEX IF EXISTS IX_OIT_topping             ON dbo.OrderItemTopping;
DROP INDEX IF EXISTS IX_Product_category_active ON dbo.Product;
DROP INDEX IF EXISTS IX_Product_name            ON dbo.Product;
DROP INDEX IF EXISTS IX_Product_lowstock        ON dbo.Product;
DROP INDEX IF EXISTS IX_ProductTopping_topping  ON dbo.ProductTopping;
DROP INDEX IF EXISTS IX_Payment_stats           ON dbo.Payment;
DROP INDEX IF EXISTS IX_LT_user_created         ON dbo.LoyaltyTransaction;
DROP INDEX IF EXISTS IX_Users_role              ON dbo.Users;
DROP INDEX IF EXISTS IX_Users_created           ON dbo.Users;
DROP INDEX IF EXISTS IX_Users_name              ON dbo.Users;
DROP INDEX IF EXISTS IX_Category_sort           ON dbo.Category;
DROP INDEX IF EXISTS IX_Topping_active_name     ON dbo.Topping;
DROP INDEX IF EXISTS IX_Promotion_active_dates  ON dbo.Promotion;
GO

/* ---------------------------------------------------------------------
   1. CAC INDEX CAN THIET (7 index)
   --------------------------------------------------------------------- */

-- (1) GET /orders/me : lich su don cua user, moi nhat truoc
DROP INDEX IF EXISTS IX_Orders_user_created ON dbo.Orders;
CREATE INDEX IX_Orders_user_created ON dbo.Orders (userId, createdAt DESC)
    INCLUDE ([status], total, orderCode);

-- (2) Admin: thong ke doanh thu / so don theo ngay-tuan-thang (loc theo khoang createdAt)
DROP INDEX IF EXISTS IX_Orders_stats ON dbo.Orders;
CREATE INDEX IX_Orders_stats ON dbo.Orders (createdAt)
    INCLUDE ([status], subtotal, discountAmount, total);

-- (3) Admin/barista: loc danh sach don theo trang thai (VD tat ca don PENDING)
DROP INDEX IF EXISTS IX_Orders_status_created ON dbo.Orders;
CREATE INDEX IX_Orders_status_created ON dbo.Orders ([status], createdAt);

-- (4) Xem chi tiet don + thong ke mon ban chay (join Orders -> OrderItem)
DROP INDEX IF EXISTS IX_OrderItem_order ON dbo.OrderItem;
CREATE INDEX IX_OrderItem_order ON dbo.OrderItem (orderId)
    INCLUDE (productId, [size], quantity, lineTotal);

-- (5) Lay cac lan thanh toan cua don (thu lai khi PAYMENT_FAILED, lay lan moi nhat)
DROP INDEX IF EXISTS IX_Payment_order ON dbo.Payment;
CREATE INDEX IX_Payment_order ON dbo.Payment (orderId, createdAt);

-- (6) Hien thi lich su trang thai cua don (timeline)
DROP INDEX IF EXISTS IX_OSH_order ON dbo.OrderStatusHistory;
CREATE INDEX IX_OSH_order ON dbo.OrderStatusHistory (orderId, changedAt);

-- (7) GET /products va admin CRUD: san pham theo danh muc, sap theo ten
DROP INDEX IF EXISTS IX_Product_category_name ON dbo.Product;
CREATE INDEX IX_Product_category_name ON dbo.Product (categoryId, [name])
    INCLUDE (isActive, stock);
GO

/* ---------------------------------------------------------------------
   2. KIEM TRA: liet ke index bo sung hien co
   --------------------------------------------------------------------- */
SELECT OBJECT_NAME(i.object_id) AS [table], i.name AS [index]
FROM sys.indexes i
WHERE i.object_id IN (SELECT object_id FROM sys.tables)
  AND i.is_primary_key = 0 AND i.is_unique_constraint = 0 AND i.type > 0
ORDER BY [table], [index];
GO

/* =====================================================================
   3. INDEX TUY CHON - CHUA TAO. Chi bat khi gap dung truong hop ben canh.
   (bo comment de tao)

   -- Top mon ban chay xuat phat tu san pham / bao cao theo tung mon cham
   -- CREATE INDEX IX_OrderItem_product ON dbo.OrderItem (productId)
   --     INCLUDE (orderId, quantity, lineTotal);

   -- Thong ke doanh thu theo Vi/The, ty le thanh toan loi
   -- CREATE INDEX IX_Payment_stats ON dbo.Payment (createdAt)
   --     INCLUDE (method, [status], amount, orderId);

   -- Thong ke topping duoc chon nhieu nhat
   -- CREATE INDEX IX_OIT_topping ON dbo.OrderItemTopping (toppingId)
   --     INCLUDE (orderItemId, price);

   -- Man hinh lich su diem thuong cua khach
   -- CREATE INDEX IX_LT_user_created ON dbo.LoyaltyTransaction (userId, createdAt DESC);

   -- Admin tim san pham theo ten (LIKE 'abc%'), so san pham len hang tram/nghin
   -- CREATE INDEX IX_Product_name ON dbo.Product ([name]);

   -- Canh bao sap het hang khi so san pham lon
   -- CREATE INDEX IX_Product_lowstock ON dbo.Product (stock)
   --     INCLUDE ([name], categoryId) WHERE isActive = 1;

   -- Dem so don theo ma khuyen mai
   -- CREATE INDEX IX_Orders_promotion ON dbo.Orders (promotionId) WHERE promotionId IS NOT NULL;

   KHONG NEN TAO cho bang nho (Category, Topping, Promotion, Role) hoac cot
   it gia tri khac nhau (Users.roleId chi co 3 gia tri): SQL Server se quet
   ca bang, index chi ton dung luong va lam ghi cham hon.
   ===================================================================== */

/* =====================================================================
   4. SAU KHI CHAY THUC TE MOT THOI GIAN: tim index KHONG duoc dung
   (so lieu reset khi khoi dong lai SQL Server)

   SELECT OBJECT_NAME(s.object_id) AS [table], i.name AS [index],
          s.user_seeks, s.user_scans, s.user_lookups, s.user_updates
   FROM sys.dm_db_index_usage_stats s
   JOIN sys.indexes i ON i.object_id = s.object_id AND i.index_id = s.index_id
   WHERE s.database_id = DB_ID() AND i.is_primary_key = 0 AND i.is_unique_constraint = 0
   ORDER BY s.user_seeks + s.user_scans + s.user_lookups;
   Index co user_updates cao ma seeks/scans = 0 la ung vien de xoa.
   ===================================================================== */