/* Jez Meds - 02: create tables */

USE JezMeds;
GO

IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users
    (
        Id           INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Users PRIMARY KEY,
        Username     NVARCHAR(50)      NOT NULL,
        PasswordHash NVARCHAR(200)     NOT NULL,
        DisplayName  NVARCHAR(100)     NOT NULL,
        Role         NVARCHAR(20)      NOT NULL CONSTRAINT DF_Users_Role DEFAULT 'Admin',
        CreatedAt    DATETIME2         NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME()
    );

    CREATE UNIQUE INDEX IX_Users_Username ON dbo.Users (Username);
END
GO

IF OBJECT_ID('dbo.Medicines', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Medicines
    (
        Id          INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Medicines PRIMARY KEY,
        Name        NVARCHAR(200)     NOT NULL,
        GenericName NVARCHAR(200)     NULL,
        Category    NVARCHAR(100)     NOT NULL,
        Quantity    INT               NOT NULL CONSTRAINT DF_Medicines_Quantity DEFAULT 0,
        UnitPrice   DECIMAL(10, 2)    NOT NULL CONSTRAINT DF_Medicines_UnitPrice DEFAULT 0,
        ExpiryDate  DATE              NULL,
        Supplier    NVARCHAR(200)     NULL,
        CreatedAt   DATETIME2         NOT NULL CONSTRAINT DF_Medicines_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt   DATETIME2         NOT NULL CONSTRAINT DF_Medicines_UpdatedAt DEFAULT SYSUTCDATETIME()
    );

    CREATE INDEX IX_Medicines_Name ON dbo.Medicines (Name);
END
GO

IF OBJECT_ID('dbo.Sales', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Sales
    (
        Id           INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Sales PRIMARY KEY,
        MedicineId   INT               NOT NULL,
        QuantitySold INT               NOT NULL,
        TotalAmount  DECIMAL(12, 2)    NOT NULL,
        SaleDate     DATETIME2         NOT NULL CONSTRAINT DF_Sales_SaleDate DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Sales_Medicines FOREIGN KEY (MedicineId)
            REFERENCES dbo.Medicines (Id) ON DELETE CASCADE
    );

    CREATE INDEX IX_Sales_MedicineId ON dbo.Sales (MedicineId);
    CREATE INDEX IX_Sales_SaleDate ON dbo.Sales (SaleDate);
END
GO
