CREATE DATABASE final;
USE final;
CREATE TABLE Category (
    Category_ID INT PRIMARY KEY,
    Category_Name VARCHAR(50) NOT NULL,
    Description VARCHAR(100)
);

CREATE TABLE Supplier (
    Supplier_ID INT PRIMARY KEY,
    Supplier_Name VARCHAR(50),
    Contact_Number VARCHAR(15),
    Email VARCHAR(50)
);

CREATE TABLE User (
    User_ID INT PRIMARY KEY,
    Username VARCHAR(50),
    Password VARCHAR(50),
    Role VARCHAR(20)
);

CREATE TABLE Product (
    Product_ID INT PRIMARY KEY,
    Product_Name VARCHAR(50),
    Unit_Price DECIMAL(10,2),
    Current_Stock INT CHECK (Current_Stock >= 0),
    Reorder_Level INT,
    Category_ID INT,
    Supplier_ID INT,
    FOREIGN KEY (Category_ID) REFERENCES Category(Category_ID),
    FOREIGN KEY (Supplier_ID) REFERENCES Supplier(Supplier_ID)
);

CREATE TABLE Transaction_Log (
    Transaction_ID INT PRIMARY KEY,
    Product_ID INT,
    User_ID INT,
    Transaction_Type VARCHAR(10),
    Quantity INT CHECK (Quantity > 0),
    Transaction_Date DATETIME,
    FOREIGN KEY (Product_ID) REFERENCES Product(Product_ID),
    FOREIGN KEY (User_ID) REFERENCES User(User_ID)
);

INSERT INTO Category VALUES (1, 'Stationery', 'Office items');
INSERT INTO Supplier VALUES (1, 'ABC Traders', '9876543210', 'abc@gmail.com');
INSERT INTO User VALUES (1, 'admin', 'admin123', 'Admin');

INSERT INTO Product VALUES
(101, 'notebook', 50.00, 100, 20, 1, 1),
(102, 'pen', 10.00, 10, 15, 1, 1);

CREATE VIEW Stock_Status AS
SELECT 
    Product_ID,
    Product_Name,
    Current_Stock,
    Reorder_Level,
    CASE
        WHEN Current_Stock < Reorder_Level THEN 'LOW STOCK'
        ELSE 'SUFFICIENT STOCK'
    END AS Stock_Status
FROM Product;