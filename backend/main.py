from db_config import get_db_connection
from voice_input import get_command
from command_parser import parse_command

db = get_db_connection()
cursor = db.cursor()

print("🎙 Voice Inventory System Started (say 'exit' to stop)\n")

while True:

    command = get_command()

    if command == "":
        continue

    if "exit" in command or "stop" in command:
        print("👋 Exiting system")
        break

    print("Command:", command)

    parsed = parse_command(command)

    action = parsed["action"]
    quantity = parsed["quantity"]
    product = parsed["product"]

    print("Parsed:", parsed)

    # ---------------- LOW STOCK ----------------
    if action == "LOW_STOCK":
        cursor.execute("""
            SELECT Product_Name, Current_Stock
            FROM Stock_Status
            WHERE Stock_Status = 'LOW STOCK'
        """)
        results = cursor.fetchall()

        if not results:
            print("✅ No low stock items")
        else:
            print("⚠️ Low Stock Items:")
            for row in results:
                print(f"{row[0]} → {row[1]} units")

    # ---------------- ADD PRODUCT ----------------
    elif action == "ADD":

        cursor.execute(f"""
            SELECT Product_ID, Current_Stock
            FROM Product
            WHERE LOWER(Product_Name)=LOWER('{product}')
        """)
        result = cursor.fetchone()

        if result:
            product_id, old_stock = result

            cursor.execute(f"""
                UPDATE Product
                SET Current_Stock = Current_Stock + {quantity}
                WHERE Product_ID = {product_id}
            """)
            db.commit()

            print(f"✅ Added {quantity} to {product}")

        else:
            cursor.execute(f"""
                INSERT INTO Product
                (Product_ID, Product_Name, Unit_Price, Current_Stock, Reorder_Level, Category_ID, Supplier_ID)
                VALUES (
                    FLOOR(RAND()*100000),
                    '{product}',
                    10.00,
                    {quantity},
                    5,
                    1,
                    1
                )
            """)
            db.commit()

            print(f"🆕 Created product '{product}' with {quantity} units")

    # ---------------- REMOVE ----------------
    elif action == "REMOVE":

        cursor.execute(f"""
            SELECT Product_ID, Current_Stock
            FROM Product
            WHERE LOWER(Product_Name)=LOWER('{product}')
        """)
        result = cursor.fetchone()

        if not result:
            print("❌ Product not found")

        else:
            product_id, stock = result

            if stock < quantity:
                print("❌ Not enough stock")

            else:
                cursor.execute(f"""
                    UPDATE Product
                    SET Current_Stock = Current_Stock - {quantity}
                    WHERE Product_ID = {product_id}
                """)
                db.commit()

                print(f"✅ Removed {quantity} from {product}")

    # ---------------- EMPLOYEE SHOW ----------------
    elif action == "SHOW_EMPLOYEES":

        cursor.execute("""
            SELECT Employee_Name, Shift FROM Employee
            WHERE Shift='morning'
        """)
        results = cursor.fetchall()

        print("👨‍💼 Employees in morning shift:")
        for row in results:
            print(row[0])

    # ---------------- ADD EMPLOYEE ----------------
    elif action == "ADD_EMPLOYEE":

        words = command.split()

        try:
            name = words[2]
            shift = words[3]
        except:
            print("❌ Format: add employee <name> <shift>")
        else:
            cursor.execute(f"""
                INSERT INTO Employee (Employee_Name, Shift, Role)
                VALUES ('{name}', '{shift}', 'staff')
            """)
            db.commit()

            print(f"🆕 Employee {name} added")

    # ---------------- UPDATE SHIFT ----------------
    elif action == "UPDATE_SHIFT":

        words = command.split()

        try:
            name = words[1]
            shift = words[-1]
        except:
            print("❌ Invalid format")
        else:
            cursor.execute(f"""
                UPDATE Employee
                SET Shift='{shift}'
                WHERE LOWER(Employee_Name)=LOWER('{name}')
            """)
            db.commit()

            print(f"🔄 Updated {name} to {shift} shift")

    else:
        print("❌ Command not recognized")

cursor.close()
db.close()