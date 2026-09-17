/* Jez Meds - 01: create the database */

IF DB_ID('JezMeds') IS NULL
BEGIN
    CREATE DATABASE JezMeds;
END
GO

USE JezMeds;
GO
