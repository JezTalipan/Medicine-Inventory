/* Jez Meds - 03: seed data
   Safe to re-run: every insert is guarded.

   Default login ->  username: admin   password: admin123
   The hash below is a real bcrypt hash of 'admin123' (cost 11).
   To change the password later, hash the new one with
   BCrypt.Net.BCrypt.HashPassword("...") and update this row. */

USE JezMeds;
GO

/* ---------- Admin user ---------- */
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username = 'admin')
BEGIN
    INSERT INTO dbo.Users (Username, PasswordHash, DisplayName, Role)
    VALUES ('admin', '$2a$11$C8T9jlkQ8NPY4PbzWNcPTua9Ga2nt.9nQIWqjt2n9sRcHefCmBcHi', 'Administrator', 'Admin');
END
GO

/* ---------- Medicines ---------- */
IF NOT EXISTS (SELECT 1 FROM dbo.Medicines)
BEGIN
    INSERT INTO dbo.Medicines (Name, GenericName, Category, Quantity, UnitPrice, ExpiryDate, Supplier)
    VALUES
        ('Biogesic 500mg',      'Paracetamol',              'Analgesic',     240,  3.50,  DATEADD(MONTH, 18, CAST(GETDATE() AS DATE)), 'Unilab'),
        ('Advil 200mg',         'Ibuprofen',                'Analgesic',     180,  8.75,  DATEADD(MONTH, 14, CAST(GETDATE() AS DATE)), 'Pfizer Consumer'),
        ('Amoxil 500mg',        'Amoxicillin',              'Antibiotic',     96, 12.00,  DATEADD(MONTH, 10, CAST(GETDATE() AS DATE)), 'GlaxoSmithKline'),
        ('Zithromax 250mg',     'Azithromycin',             'Antibiotic',      8, 45.00,  DATEADD(MONTH,  9, CAST(GETDATE() AS DATE)), 'Pfizer'),
        ('Claritin 10mg',       'Loratadine',               'Antihistamine', 150, 15.25,  DATEADD(MONTH, 20, CAST(GETDATE() AS DATE)), 'Bayer'),
        ('Benadryl 25mg',       'Diphenhydramine',          'Antihistamine',   6,  9.50,  DATEADD(DAY,   25, CAST(GETDATE() AS DATE)), 'Johnson & Johnson'),
        ('Kremil-S',            'Aluminium/Magnesium',      'Antacid',       120,  6.00,  DATEADD(MONTH, 16, CAST(GETDATE() AS DATE)), 'Unilab'),
        ('Omepron 20mg',        'Omeprazole',               'Antacid',        75, 18.40,  DATEADD(MONTH, 12, CAST(GETDATE() AS DATE)), 'Pascual Lab'),
        ('Enervon Multivitamin','Multivitamins + Zinc',     'Vitamin',       300,  7.80,  DATEADD(MONTH, 22, CAST(GETDATE() AS DATE)), 'Unilab'),
        ('Ascof Lagundi 600mg', 'Lagundi Extract',          'Cough & Cold',   90, 11.00,  DATEADD(MONTH, 15, CAST(GETDATE() AS DATE)), 'Pascual Lab'),
        ('Neozep Forte',        'Phenylephrine/Paracetamol','Cough & Cold',    4,  5.25,  DATEADD(MONTH,  8, CAST(GETDATE() AS DATE)), 'Unilab'),
        ('Losartan 50mg',       'Losartan Potassium',       'Cardiovascular', 140, 14.60, DATEADD(MONTH, 19, CAST(GETDATE() AS DATE)), 'Therapharma');
END
GO

/* ---------- Sample sales spread over the last 60 days ---------- */
IF NOT EXISTS (SELECT 1 FROM dbo.Sales)
BEGIN
    DECLARE @i INT = 0;
    DECLARE @medicineId INT;
    DECLARE @unitPrice DECIMAL(10, 2);
    DECLARE @qty INT;
    DECLARE @daysAgo INT;

    /* Deterministic-ish spread: 60 sales across the seeded medicines. */
    WHILE @i < 60
    BEGIN
        SELECT TOP 1 @medicineId = Id, @unitPrice = UnitPrice
        FROM dbo.Medicines
        ORDER BY (Id + @i * 7) % 12, Id;

        SET @qty = 1 + (@i * 3) % 9;
        SET @daysAgo = (@i * 991) % 60;

        INSERT INTO dbo.Sales (MedicineId, QuantitySold, TotalAmount, SaleDate)
        VALUES (
            @medicineId,
            @qty,
            @qty * @unitPrice,
            DATEADD(MINUTE, (@i * 37) % 600, DATEADD(DAY, -@daysAgo, CAST(GETDATE() AS DATETIME2)))
        );

        SET @i = @i + 1;
    END
END
GO

SELECT 'Users' AS TableName, COUNT(*) AS Rows FROM dbo.Users
UNION ALL SELECT 'Medicines', COUNT(*) FROM dbo.Medicines
UNION ALL SELECT 'Sales', COUNT(*) FROM dbo.Sales;
GO
