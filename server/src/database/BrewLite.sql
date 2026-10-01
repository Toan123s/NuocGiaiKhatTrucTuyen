/* =====================================================================
   BrewLite - Schema (SQL Server 2016+)
   Chay file nay TRUOC file index. Chay lai nhieu lan an toan
   (bang nao da co thi bo qua, khong xoa du lieu).
   ===================================================================== */
IF DB_ID('BrewLite') IS NULL
    CREATE DATABASE BrewLite;
GO
USE BrewLite;
GO

/* ---------- Role ---------- */
IF OBJECT_ID('dbo.Role', 'U') IS NULL
CREATE TABLE dbo.Role (
    id    INT IDENTITY(1,1) CONSTRAINT PK_Role PRIMARY KEY,
    name  NVARCHAR(50) NOT NULL CONSTRAINT UQ_Role_name UNIQUE   -- CUSTOMER / BARISTA / ADMIN
);
GO

/* ---------- Users ---------- */
IF OBJECT_ID('dbo.Users', 'U') IS NULL
CREATE TABLE dbo.Users (
    id            INT IDENTITY(1,1) CONSTRAINT PK_Users PRIMARY KEY,
    roleId        INT            NOT NULL CONSTRAINT FK_Users_Role REFERENCES dbo.Role(id),
    name          NVARCHAR(100)  NOT NULL,
    email         NVARCHAR(255)  NOT NULL CONSTRAINT UQ_Users_email UNIQUE,
    phone         NVARCHAR(20)   NULL,
    passwordHash  NVARCHAR(255)  NOT NULL,
    loyaltyPoints INT            NOT NULL CONSTRAINT DF_Users_points DEFAULT 0,
    isActive      BIT            NOT NULL CONSTRAINT DF_Users_active DEFAULT 1,
    createdAt     DATETIME2(0)   NOT NULL CONSTRAINT DF_Users_created DEFAULT SYSUTCDATETIME()
);
GO

/* ---------- Category ---------- */
IF OBJECT_ID('dbo.Category', 'U') IS NULL
CREATE TABLE dbo.Category (
    id        INT IDENTITY(1,1) CONSTRAINT PK_Category PRIMARY KEY,
    name      NVARCHAR(100) NOT NULL CONSTRAINT UQ_Category_name UNIQUE,
    sortOrder INT           NOT NULL CONSTRAINT DF_Category_sort DEFAULT 0
);
GO

/* ---------- Product ---------- */
IF OBJECT_ID('dbo.Product', 'U') IS NULL
CREATE TABLE dbo.Product (
    id          INT IDENTITY(1,1) CONSTRAINT PK_Product PRIMARY KEY,
    categoryId  INT            NOT NULL CONSTRAINT FK_Product_Category REFERENCES dbo.Category(id),
    name        NVARCHAR(150)  NOT NULL,
    description NVARCHAR(500)  NULL,
    imageUrl    NVARCHAR(500)  NULL,
    priceS      DECIMAL(12,0)  NOT NULL CONSTRAINT CK_Product_priceS CHECK (priceS >= 0),
    priceM      DECIMAL(12,0)  NOT NULL CONSTRAINT CK_Product_priceM CHECK (priceM >= 0),
    priceL      DECIMAL(12,0)  NOT NULL CONSTRAINT CK_Product_priceL CHECK (priceL >= 0),
    stock       INT            NOT NULL CONSTRAINT DF_Product_stock DEFAULT 0 CONSTRAINT CK_Product_stock CHECK (stock >= 0),
    isActive    BIT            NOT NULL CONSTRAINT DF_Product_active DEFAULT 1,
    createdAt   DATETIME2(0)   NOT NULL CONSTRAINT DF_Product_created DEFAULT SYSUTCDATETIME()
);
GO

/* ---------- Topping ---------- */
IF OBJECT_ID('dbo.Topping', 'U') IS NULL
CREATE TABLE dbo.Topping (
    id       INT IDENTITY(1,1) CONSTRAINT PK_Topping PRIMARY KEY,
    name     NVARCHAR(100) NOT NULL CONSTRAINT UQ_Topping_name UNIQUE,
    price    DECIMAL(12,0) NOT NULL CONSTRAINT CK_Topping_price CHECK (price >= 0),
    isActive BIT           NOT NULL CONSTRAINT DF_Topping_active DEFAULT 1
);
GO

/* ---------- ProductTopping (san pham nao duoc them topping nao) ---------- */
IF OBJECT_ID('dbo.ProductTopping', 'U') IS NULL
CREATE TABLE dbo.ProductTopping (
    productId INT NOT NULL CONSTRAINT FK_PT_Product REFERENCES dbo.Product(id) ON DELETE CASCADE,
    toppingId INT NOT NULL CONSTRAINT FK_PT_Topping REFERENCES dbo.Topping(id) ON DELETE CASCADE,
    CONSTRAINT PK_ProductTopping PRIMARY KEY (productId, toppingId)
);
GO

/* ---------- Promotion ---------- */
IF OBJECT_ID('dbo.Promotion', 'U') IS NULL
CREATE TABLE dbo.Promotion (
    id            INT IDENTITY(1,1) CONSTRAINT PK_Promotion PRIMARY KEY,
    code          NVARCHAR(50)  NOT NULL CONSTRAINT UQ_Promotion_code UNIQUE,
    discountType  NVARCHAR(10)  NOT NULL CONSTRAINT CK_Promotion_type CHECK (discountType IN ('PERCENT','FIXED')),
    discountValue DECIMAL(12,0) NOT NULL CONSTRAINT CK_Promotion_value CHECK (discountValue > 0),
    minOrder      DECIMAL(12,0) NOT NULL CONSTRAINT DF_Promotion_min DEFAULT 0,
    maxDiscount   DECIMAL(12,0) NULL,
    startDate     DATETIME2(0)  NOT NULL,
    endDate       DATETIME2(0)  NOT NULL,
    isActive      BIT           NOT NULL CONSTRAINT DF_Promotion_active DEFAULT 1,
    CONSTRAINT CK_Promotion_dates CHECK (endDate >= startDate)
);
GO

/* ---------- Orders ---------- */
IF OBJECT_ID('dbo.Orders', 'U') IS NULL
CREATE TABLE dbo.Orders (
    id             INT IDENTITY(1,1) CONSTRAINT PK_Orders PRIMARY KEY,
    orderCode      NVARCHAR(30)  NOT NULL CONSTRAINT UQ_Orders_code UNIQUE,
    userId         INT           NOT NULL CONSTRAINT FK_Orders_User REFERENCES dbo.Users(id),
    promotionId    INT           NULL     CONSTRAINT FK_Orders_Promotion REFERENCES dbo.Promotion(id),
    [status]       NVARCHAR(20)  NOT NULL CONSTRAINT DF_Orders_status DEFAULT 'PENDING'
                   CONSTRAINT CK_Orders_status CHECK ([status] IN
                     ('PENDING','PAID','PREPARING','READY','COMPLETED','CANCELLED','PAYMENT_FAILED')),
    subtotal       DECIMAL(12,0) NOT NULL CONSTRAINT CK_Orders_subtotal CHECK (subtotal >= 0),
    discountAmount DECIMAL(12,0) NOT NULL CONSTRAINT DF_Orders_discount DEFAULT 0,
    total          DECIMAL(12,0) NOT NULL CONSTRAINT CK_Orders_total CHECK (total >= 0),
    note           NVARCHAR(500) NULL,
    createdAt      DATETIME2(0)  NOT NULL CONSTRAINT DF_Orders_created DEFAULT SYSUTCDATETIME()
);
GO

/* ---------- OrderItem ---------- */
IF OBJECT_ID('dbo.OrderItem', 'U') IS NULL
CREATE TABLE dbo.OrderItem (
    id        INT IDENTITY(1,1) CONSTRAINT PK_OrderItem PRIMARY KEY,
    orderId   INT           NOT NULL CONSTRAINT FK_OI_Order   REFERENCES dbo.Orders(id) ON DELETE CASCADE,
    productId INT           NOT NULL CONSTRAINT FK_OI_Product REFERENCES dbo.Product(id),
    [size]    CHAR(1)       NOT NULL CONSTRAINT CK_OI_size CHECK ([size] IN ('S','M','L')),
    quantity  INT           NOT NULL CONSTRAINT CK_OI_qty CHECK (quantity > 0),
    unitPrice DECIMAL(12,0) NOT NULL,
    lineTotal DECIMAL(12,0) NOT NULL
);
GO

/* ---------- OrderItemTopping ---------- */
IF OBJECT_ID('dbo.OrderItemTopping', 'U') IS NULL
CREATE TABLE dbo.OrderItemTopping (
    id          INT IDENTITY(1,1) CONSTRAINT PK_OIT PRIMARY KEY,
    orderItemId INT           NOT NULL CONSTRAINT FK_OIT_Item    REFERENCES dbo.OrderItem(id) ON DELETE CASCADE,
    toppingId   INT           NOT NULL CONSTRAINT FK_OIT_Topping REFERENCES dbo.Topping(id),
    price       DECIMAL(12,0) NOT NULL
);
GO

/* ---------- Payment ---------- */
IF OBJECT_ID('dbo.Payment', 'U') IS NULL
CREATE TABLE dbo.Payment (
    id            INT IDENTITY(1,1) CONSTRAINT PK_Payment PRIMARY KEY,
    orderId       INT           NOT NULL CONSTRAINT FK_Payment_Order REFERENCES dbo.Orders(id) ON DELETE CASCADE,
    method        NVARCHAR(20)  NOT NULL CONSTRAINT CK_Payment_method CHECK (method IN ('CASH','WALLET','CARD')),
    [status]      NVARCHAR(20)  NOT NULL CONSTRAINT DF_Payment_status DEFAULT 'PENDING'
                  CONSTRAINT CK_Payment_status CHECK ([status] IN ('PENDING','SUCCESS','FAILED')),
    amount        DECIMAL(12,0) NOT NULL CONSTRAINT CK_Payment_amount CHECK (amount >= 0),
    transactionId NVARCHAR(100) NULL,
    createdAt     DATETIME2(0)  NOT NULL CONSTRAINT DF_Payment_created DEFAULT SYSUTCDATETIME()
);
GO

/* ---------- OrderStatusHistory ---------- */
IF OBJECT_ID('dbo.OrderStatusHistory', 'U') IS NULL
CREATE TABLE dbo.OrderStatusHistory (
    id        INT IDENTITY(1,1) CONSTRAINT PK_OSH PRIMARY KEY,
    orderId   INT          NOT NULL CONSTRAINT FK_OSH_Order REFERENCES dbo.Orders(id) ON DELETE CASCADE,
    [status]  NVARCHAR(20) NOT NULL,
    changedBy INT          NULL CONSTRAINT FK_OSH_User REFERENCES dbo.Users(id),
    changedAt DATETIME2(0) NOT NULL CONSTRAINT DF_OSH_changed DEFAULT SYSUTCDATETIME()
);
GO

/* ---------- LoyaltyTransaction ---------- */
IF OBJECT_ID('dbo.LoyaltyTransaction', 'U') IS NULL
CREATE TABLE dbo.LoyaltyTransaction (
    id        INT IDENTITY(1,1) CONSTRAINT PK_LT PRIMARY KEY,
    userId    INT          NOT NULL CONSTRAINT FK_LT_User  REFERENCES dbo.Users(id),
    orderId   INT          NULL     CONSTRAINT FK_LT_Order REFERENCES dbo.Orders(id),
    points    INT          NOT NULL,                       -- duong: tich diem, am: dung diem
    reason    NVARCHAR(100) NULL,
    createdAt DATETIME2(0) NOT NULL CONSTRAINT DF_LT_created DEFAULT SYSUTCDATETIME()
);
GO

/* ---------- Du lieu mau toi thieu (role) ---------- */
IF NOT EXISTS (SELECT 1 FROM dbo.Role)
    INSERT INTO dbo.Role (name) VALUES (N'CUSTOMER'), (N'BARISTA'), (N'ADMIN');
GO

SELECT name AS [table] FROM sys.tables ORDER BY name;
GO